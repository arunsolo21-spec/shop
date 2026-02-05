import pandas as pd
import json
import psycopg2
import os

# ==========================================
# 1. CONFIGURATION
# ==========================================
# 🔴 These match your Docker setup perfectly
DB_HOST = "localhost"
DB_NAME = "grocery_db"
DB_USER = "postgres"
DB_PASS = "password"
DB_PORT = "5432"

# Path to your clean JSON file
INPUT_FILE = r"C:\Users\arun0\Videos\grocery_system\assests\Final_Cleaned_Inventory.json"

# Quotas for a Balanced Store (Top 1000 Items)
CATEGORY_QUOTAS = {
    "Rice & Grains": 100, "Dals & Pulses": 80, "Oils & Ghee": 60,
    "Spices & Masala": 120, "Beverages": 80, "Snacks & Chocolates": 150,
    "Personal Care": 120, "Household & Cleaning": 80, "Dairy & Fresh": 40,
    "Baby Care": 30, "Pooja Needs": 40, "Stationery & Others": 100
}

def clean_name_for_display(row):
    """
    Creates the 'Display Name' for the App.
    Example: 'Bovonto' + 1.5 + 'Ltr' -> 'Bovonto 1.5 Ltr'
    """
    name = str(row['clean_name']).strip()
    size = row['size']
    unit = str(row['unit']).strip()
    
    # Don't show size if it's "1 pcs" (e.g., "Maggie 1 pcs" -> "Maggie")
    if unit.lower() in ['pcs', 'no', 'nos'] and size == 1:
        return name
        
    # Remove decimal if it's a whole number (e.g. 500.0 -> 500)
    size_str = str(int(size)) if size % 1 == 0 else str(size)
    
    return f"{name} {size_str} {unit}"

def seed_local_database():
    print("🚀 Starting Local Seeder...")
    
    # 1. Load Data
    if not os.path.exists(INPUT_FILE):
        print(f"❌ Error: Input file not found at: {INPUT_FILE}")
        return

    try:
        with open(INPUT_FILE, 'r', encoding='utf-8') as f:
            data = json.load(f)
        df = pd.DataFrame(data)
    except Exception as e:
        print(f"❌ Error reading JSON file: {e}")
        return

    print(f"   Loaded {len(df)} total products from JSON.")

    # 2. Select Top 1000 (Smart Shelf Logic)
    print("   Selecting best 1000 products...")
    
    # Sort: Branded items first, then Highest Price (Quality)
    df['is_branded'] = df['brand'].apply(lambda x: 0 if str(x).lower() == 'generic' else 1)
    df = df.sort_values(by=['is_branded', 'mrp'], ascending=[False, False])
    
    final_items = []
    
    # Pick top items per category
    for category, quota in CATEGORY_QUOTAS.items():
        cat_df = df[df['category'] == category]
        selected = cat_df.head(quota)
        final_items.extend(selected.to_dict('records'))

    # Fill remaining spots if under 1000
    if len(final_items) < 1000:
        needed = 1000 - len(final_items)
        selected_names = set([x['original_name'] for x in final_items])
        remaining = df[~df['original_name'].isin(selected_names)]
        final_items.extend(remaining.head(needed).to_dict('records'))

    print(f"   Ready to insert {len(final_items)} balanced items.")

    # 3. Connect & Insert into Docker Database
    try:
        conn = psycopg2.connect(
            host=DB_HOST,
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASS,
            port=DB_PORT
        )
        cursor = conn.cursor()
        
        print("   Connected to Docker Database (localhost:5432).")
        
        # Clear old data to prevent duplicates
        print("   Clearing old products...")
        cursor.execute('TRUNCATE TABLE "Product" RESTART IDENTITY CASCADE;')
        
        print("   Uploading data...")
        
        # SQL Query matching your exact Prisma Schema
        query = """
        INSERT INTO "Product" (name, category, mrp, size, unit, "isAvailable", "updatedAt")
        VALUES (%s, %s, %s, %s, %s, true, NOW())
        """
        
        count = 0
        for item in final_items:
            # We explicitly pass the cleaned name as 'name'
            # But we ALSO save the raw size/unit for filtering later
            display_name = clean_name_for_display(item)
            
            cursor.execute(query, (
                display_name,       # name (e.g. "Bovonto 1.5 Ltr")
                item['category'],   # category
                item['mrp'],        # mrp
                item['size'],       # size
                item['unit']        # unit
            ))
            count += 1
            
        conn.commit()
        cursor.close()
        conn.close()
        print(f"✅ SUCCESS! {count} Products uploaded to Local Database.")
        print("   You can now start your app with 'npm run dev'.")
        
    except Exception as e:
        print(f"❌ Database Error: {e}")
        print("   1. Is Docker running? (Run: 'docker start grocery_db_container')")
        print("   2. Did you run migration? (Run: 'npx prisma migrate dev')")

if __name__ == "__main__":
    seed_local_database()