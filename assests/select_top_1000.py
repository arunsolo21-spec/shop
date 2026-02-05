import pandas as pd
import json
import psycopg2
import os

# ==========================================
# 1. LOCAL CONFIGURATION
# ==========================================
# 🔴 CHANGE 'your_password' TO YOUR REAL POSTGRES PASSWORD
DB_HOST = "localhost"
DB_NAME = "grocery_db"
DB_USER = "postgres"
DB_PASS = "your_password" 
DB_PORT = "5432"

INPUT_FILE = r"C:\Users\arun0\Videos\grocery_system\assests\Final_Cleaned_Inventory.json"

# Quotas for a Balanced Store (Top 1000)
CATEGORY_QUOTAS = {
    "Rice & Grains": 100, "Dals & Pulses": 80, "Oils & Ghee": 60,
    "Spices & Masala": 120, "Beverages": 80, "Snacks & Chocolates": 150,
    "Personal Care": 120, "Household & Cleaning": 80, "Dairy & Fresh": 40,
    "Baby Care": 30, "Pooja Needs": 40, "Stationery & Others": 100
}

def clean_name_for_display(row):
    """Combines Name + Size + Unit (e.g., 'Bovonto 1.5 Ltr')"""
    name = str(row['clean_name']).strip()
    size = row['size']
    unit = str(row['unit']).strip()
    
    # Don't show size if it's "1 pcs"
    if unit.lower() in ['pcs', 'no', 'nos'] and size == 1:
        return name
        
    size_str = str(int(size)) if size % 1 == 0 else str(size)
    return f"{name} {size_str} {unit}"

def seed_local_database():
    print("🚀 Starting Local Seeder...")
    
    # 1. Load Data
    if not os.path.exists(INPUT_FILE):
        print(f"❌ Error: {INPUT_FILE} not found.")
        return

    try:
        with open(INPUT_FILE, 'r', encoding='utf-8') as f:
            data = json.load(f)
        df = pd.DataFrame(data)
    except Exception as e:
        print(f"❌ Error reading JSON: {e}")
        return

    print(f"   Loaded {len(df)} products from JSON.")

    # 2. Select Top 1000 (Smart Shelf Logic)
    print("   Selecting best 1000 products...")
    df['is_branded'] = df['brand'].apply(lambda x: 0 if str(x).lower() == 'generic' else 1)
    df = df.sort_values(by=['is_branded', 'mrp'], ascending=[False, False])
    
    final_items = []
    for category, quota in CATEGORY_QUOTAS.items():
        cat_df = df[df['category'] == category]
        selected = cat_df.head(quota)
        final_items.extend(selected.to_dict('records'))

    # Fill remaining
    if len(final_items) < 1000:
        needed = 1000 - len(final_items)
        selected_names = set([x['original_name'] for x in final_items])
        remaining = df[~df['original_name'].isin(selected_names)]
        final_items.extend(remaining.head(needed).to_dict('records'))

    print(f"   Ready to insert {len(final_items)} items.")

    # 3. Connect & Insert
    try:
        conn = psycopg2.connect(
            host=DB_HOST,
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASS,
            port=DB_PORT
        )
        cursor = conn.cursor()
        
        print("   Connected to Local Database.")
        print("   Clearing old products (TRUNCATE)...")
        # Clears table so you don't get duplicates if you run this twice
        cursor.execute('TRUNCATE TABLE "Product" RESTART IDENTITY CASCADE;')
        
        print("   Uploading data...")
        
        # Matches your Prisma Schema exactly
        query = """
        INSERT INTO "Product" (name, category, mrp, size, unit, "isAvailable", "updatedAt")
        VALUES (%s, %s, %s, %s, %s, true, NOW())
        """
        
        for item in final_items:
            display_name = clean_name_for_display(item)
            cursor.execute(query, (
                display_name,
                item['category'],
                item['mrp'],
                item['size'],
                item['unit']
            ))
            
        conn.commit()
        cursor.close()
        conn.close()
        print("✅ SUCCESS! 1000 Products are now in your Local Database.")
        
    except Exception as e:
        print(f"❌ Database Error: {e}")
        print("   Make sure pgAdmin is open and password is correct.")

if __name__ == "__main__":
    seed_local_database()