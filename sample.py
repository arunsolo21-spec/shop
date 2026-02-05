import pandas as pd
import os
import re
import shutil

# ==============================================================================
# 1. THE "RESEARCHED" RULE BOOK (Taxonomy + Internet Brands)
# ==============================================================================
# I have combined your JSON structure with top Indian brands found via research.
# This ensures "Horlicks" goes to Beverages, not Snacks.

TAXONOMY = {
    "Rice & Grains (Arisi & Dhanyam)": [
        # JSON Keywords
        "rice", "arisi", "ponni", "basmati", "sona", "masoori", "idli", "raw rice", 
        "pacharisi", "seeraga", "samba", "matta", "boiled", "puzhungal", 
        "kuthiraivali", "barnyard", "karuppu", "kavuni", "wheat", "godhumai", 
        "ragi", "kezhvaragu", "kambu", "bajra", "cholam", "jowar", "samai", 
        "millet", "ak vella", "manachanallur", "karnataka", "thanjavur", 
        "athisaya", "rubco", "india gate", "kohinoor", "daawat", "lal qilla", 
        "unity", "ricela", "bemisal", "rozana", "kr", "gopu", "rajabogam", 
        "vellakaar", "ration", "kurunai", "shivaji", "bpt", "kolam", "bullet",
        "aashirvaad", "pilsbury", "fortune", "nature fresh"
    ],

    "Dals, Pulses & Flours (Paruppu & Maavu)": [
        "dal", "paruppu", "toor", "thuvaram", "urad", "ulundham", "moong", "paasi", 
        "gram", "kadalai", "roasted gram", "pottukadalai", "chana", "masoor", 
        "rajma", "peas", "pattani", "cowpea", "karamani", "thatta payaru", 
        "flour", "maavu", "atta", "maida", "rava", "sooji", "besan", "rice flour", 
        "corn flour", "ragi flour", "bajra flour", "jowar flour", "udhaiyam", 
        "tata sampann", "naga", "anil", "bambino", "maitha"
    ],

    "Edible Oils & Ghee (Ennai & Nei)": [
        "oil", "ennai", "ghee", "nei", "sunflower", "groundnut", "gingelly", 
        "sesame", "coconut", "mustard", "refined", "rice bran", "olive", 
        "vanaspati", "gold winner", "fortune", "freedom", "sunland", "idhayam", 
        "vvd", "parachute", "klf", "til", "nallennai", "kadalai ennai", 
        "theengai", "deepam", "rkg", "grb", "udhayakrishna", "aavin ghee", 
        "manthra", "saffola", "sundrop", "dhara", "dalda"
    ],

    "Spices & Masalas (Maligai Saman)": [
        "masala", "spices", "chilli", "coriander", "turmeric", "pepper", "cumin", 
        "mustard", "fenugreek", "fennel", "clove", "cardamom", "cinnamon", 
        "anise", "poppy", "tamarind", "puli", "asafoetida", "hing", "sambar", 
        "rasam", "chicken 65", "garam", "biryani", "podi", "powder", "thool", 
        "milagai", "dhania", "manjal", "milagu", "jeeragam", "kadugu", "vendhayam", 
        "sombu", "elakkai", "pattai", "kasa kasa", "aachi", "sakthi", "777", 
        "priya", "mtr", "everest", "eastern", "catch", "goldiee"
    ],

    "Beverages (Tea, Coffee & Health Drinks)": [
        # Research: Added major health drinks and tea/coffee brands
        "tea", "coffee", "beverage", "drink", "health drink", "juice", "soda", 
        "syrup", "squash", "water", "malt", "horlicks", "boost", "complan", 
        "bournvita", "maltova", "pediasure", "ensure", "protinex", "manna", 
        "3 roses", "taj mahal", "bru", "nescafe", "sunrise", "lipton", "red label", 
        "avt", "narasus", "leo", "cothas", "green tea", "tetley", "tata tea", 
        "maaza", "slice", "frooti", "coke", "pepsi", "sprite", "mirinda", "7up", 
        "fanta", "limca", "bovonto", "vibro", "paneer soda", "rose milk", 
        "badam milk", "glucose", "tang", "rasna", "rooh afza", "hershey"
    ],

    "Snacks & Processed Foods": [
        "biscuit", "cookie", "cake", "rusk", "chips", "mixture", "murukku", 
        "sev", "sweet", "chocolate", "candy", "noodles", "pasta", "vermicelli", 
        "semiya", "sauce", "ketchup", "jam", "pickle", "papad", "appalam", 
        "britannia", "parle", "sunfeast", "oreo", "mom", "good day", "marie", 
        "milk bikis", "bourbon", "50-50", "krackjack", "monaco", "hide & seek", 
        "lays", "kurkure", "bingo", "haldiram", "balaji", "cadbury", "nestle", 
        "amul", "kitkat", "munch", "perk", "dairy milk", "5 star", "maggi", 
        "yippee", "top ramen", "knorr", "kissan", "lion dates", "roast", "baji"
    ],

    "Personal Care": [
        "soap", "shampoo", "conditioner", "paste", "toothbrush", "cream", 
        "lotion", "powder", "talc", "oil", "face wash", "hand wash", "sanitizer", 
        "razor", "blade", "shaving", "perfume", "deodorant", "hair color", "dye", 
        "santoor", "lux", "lifebuoy", "dettol", "cinthol", "hamam", "rexona", 
        "pears", "dove", "medimix", "mysore sandal", "fiama", "vivel", "liril", 
        "himalaya", "mamaearth", "biotique", "clinic plus", "sunsilk", "head & shoulders", 
        "pantene", "tresemme", "chik", "meera", "karthika", "colgate", "pepsodent", 
        "close up", "sensodyne", "dabur red", "vicco", "ponds", "fair & lovely", 
        "glow & lovely", "nivea", "vaseline", "axe", "fogg", "engage", "yardley", 
        "gillette", "whisper", "stayfree", "sofy"
    ],

    "Household Cleaning & Detergents": [
        "detergent", "powder", "liquid", "bar", "soap", "dish", "wash", "cleaner", 
        "scrubber", "mop", "broom", "toilet", "floor", "glass", "mosquito", 
        "repellent", "coil", "mat", "air freshener", "rin", "surf excel", "ariel", 
        "tide", "henko", "ghadi", "wheel", "nirma", "mr white", "ujala", "vanish", 
        "comfort", "genteel", "ezee", "vim", "exo", "pril", "sabena", "lizol", 
        "domex", "harpic", "colin", "lysol", "good knight", "all out", "hit", 
        "odonil", "ambipur"
    ],

    "Pooja Needs": [
        "pooja", "agarbathi", "incense", "camphor", "karpooram", "soodam", 
        "sambrani", "oil", "deepam", "wicks", "thiri", "kumkum", "turmeric", 
        "sandal", "vibuthi", "rose water", "panneer", "matchbox", "ghee wicks", 
        "cycle", "mangaldeep", "home", "divine"
    ],

    "Baby Care": [
        "diaper", "wipes", "baby food", "cereal", "soap", "shampoo", "oil", 
        "powder", "lotion", "pampers", "mamy poko", "huggies", "cerelac", 
        "lactogen", "nan", "nestle", "johnsons", "himalaya baby", "sebamed", 
        "baby dove"
    ],

    "Dairy Products": [
        "milk", "curd", "paneer", "butter", "ghee", "cheese", "cream", "yogurt", 
        "buttermilk", "lassi", "shrikhand", "amul", "aavin", "milky mist", 
        "cavins", "hatsun", "arun", "nandini", "mother dairy", "britannia cheese", 
        "gowardhan"
    ],

    "Stationery & General Items": [
        "pen", "pencil", "notebook", "paper", "glue", "tape", "battery", "bulb", 
        "scissors", "stapler", "marker", "eraser", "sharpener", "scale", "chart", 
        "camlin", "natraj", "apsara", "classmate", "cello", "reynolds", "duracell", 
        "eveready", "philips", "wipro", "syska", "fevicol", "kangaro"
    ]
}

# ==============================================================================
# 2. ANALYSIS & PROCESSING FUNCTIONS
# ==============================================================================

def clean_text(text):
    if not isinstance(text, str): return ""
    return re.sub(r'[^a-z0-9\s]', '', text.lower())

def categorize_product(product_name):
    """Matches product name to the refined taxonomy."""
    clean_name = clean_text(product_name)
    
    # Check strict category rules
    for category, keywords in TAXONOMY.items():
        for keyword in keywords:
            # We look for whole words or strong partial matches
            if f" {keyword} " in f" {clean_name} " or keyword in clean_name.split():
                return category
            # Fallback for compound words like 'goldwinner'
            if len(keyword) > 4 and keyword in clean_name:
                return category
                
    return "Others (Uncategorized)"

def generate_analysis_report(df, output_file):
    """Generates a business analysis report of the inventory."""
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write("=== GROCERY INVENTORY ANALYSIS REPORT ===\n")
        f.write("Generated using: Intelligent Taxonomy Matching\n\n")
        
        # 1. Category Breakdown
        f.write("1. CATEGORY DISTRIBUTION:\n")
        f.write("-" * 40 + "\n")
        cat_counts = df['Category'].value_counts()
        for cat, count in cat_counts.items():
            f.write(f"{cat:<50} : {count} products\n")
        
        # 2. Price Analysis
        f.write("\n2. VALUE ANALYSIS (Approximate):\n")
        f.write("-" * 40 + "\n")
        # Ensure MRP is numeric
        df['MRP'] = pd.to_numeric(df['MRP'], errors='coerce').fillna(0)
        total_value = df['MRP'].sum()
        f.write(f"Total Inventory Value (MRP)          : Rs. {total_value:,.2f}\n")
        f.write(f"Average Product Price                : Rs. {df['MRP'].mean():.2f}\n")
        
        # 3. Top Expensive Items
        f.write("\n3. TOP 5 MOST EXPENSIVE ITEMS:\n")
        f.write("-" * 40 + "\n")
        top_items = df.nlargest(5, 'MRP')[['MaterialName', 'MRP']]
        for _, row in top_items.iterrows():
            f.write(f"{row['MaterialName'][:40]:<40} : Rs. {row['MRP']}\n")

# ==============================================================================
# 3. MAIN EXECUTION
# ==============================================================================

def main():
    input_file = "Full_Product_List.csv"
    output_dir = "Organized_Product_Data_v2"
    report_file = "Stock_Analysis_Report.txt"
    
    print(f"Reading {input_file}...")
    
    # Try reading with different encodings
    try:
        df = pd.read_csv(input_file, encoding='utf-8')
    except:
        df = pd.read_csv(input_file, encoding='latin1')
        
    # Clean and Categorize
    print("Classifying products using expanded taxonomy...")
    df['Category'] = df['MaterialName'].fillna("").apply(categorize_product)
    
    # Generate Output Folders
    if os.path.exists(output_dir):
        shutil.rmtree(output_dir)
    os.makedirs(output_dir)
    
    print(f"Saving categorized files to {output_dir}/ ...")
    for category in df['Category'].unique():
        # Clean folder name (remove special chars for OS safety)
        safe_folder_name = re.sub(r'[<>:"/\\|?*]', '', category).strip()
        folder_path = os.path.join(output_dir, safe_folder_name)
        os.makedirs(folder_path, exist_ok=True)
        
        # Save CSV
        sub_df = df[df['Category'] == category]
        sub_df.to_csv(os.path.join(folder_path, f"{safe_folder_name}.csv"), index=False)
        print(f"   -> {category}: {len(sub_df)} items")
        
    # Generate Analysis
    print("Generating Analysis Report...")
    generate_analysis_report(df, report_file)
    
    print("\nSUCCESS! Process Completed.")
    print(f"1. Categorized Data: {output_dir}/")
    print(f"2. Analysis Report : {report_file}")

if __name__ == "__main__":
    main()