import pandas as pd
import json
import re
import os
from collections import Counter

# ==========================================
# 1. STRICT CONFIGURATION (EMBEDDED)
# ==========================================
# This contains EVERY word from your provided JSON file.
CONFIG = {
  "category_keywords": {
    "Rice & Grains": {
      "english": ["rice", "ponni", "basmathi", "ravai", "samba", "kurunai", "brown rice", "rava", "flour", "atta", "maida", "kallamavu", "puttu maavu", "raagi", "kambu", "varaku", "saamai", "kuthiraivali", "aval", "pachcharisi", "idli rice", "semiya", "noodles"],
      "tamil": ["அரிசி", "பொன்னி", "பாஸ்மதி", "ரவை", "சம்பா", "குருனை", "பிரவுன் ரைஸ்", "ரவா", "மாவு", "ஆட்டா", "மைதா", "கள்ளமாவு", "புட்டுமாவு", "ராகி", "கம்பு", "வரகு", "சாமை", "குதிரைவாலி", "அவல்", "பச்சரிசி", "இட்லி அரிசி", "சேமியா", "நூடல்ஸ்"],
      "tanglish": ["arisi", "ponni", "bashmathi", "ravai", "samba", "kurunai", "brown rice", "rava", "maavu", "atta", "maida", "kallamavu", "puttu maavu", "raagi", "kambu", "varaku", "saamai", "kuthiraivali", "aval", "pachcharisi", "idli arisi", "semiyaa", "noodles"]
    },
    "Dals & Pulses": {
      "english": ["paruppu", "pottukadalai", "kallaparuppu", "thuvaram", "varupattani", "pattani", "moong", "dal", "dall", "toor", "urad", "chana", "gram", "peas", "ulundhu", "payaru"],
      "tamil": ["பருப்பு", "பொட்டுகடலை", "கடலைப்பருப்பு", "துவரம்", "வறுபட்டாணி", "பட்டாணி", "பாசிப்பருப்பு", "உளுந்து", "கடலை", "பயறு"],
      "tanglish": ["paruppu", "pottukadalai", "kallaparuppu", "thuvaram", "varupattani", "pattani", "moong", "dal", "dall", "toor", "urad", "chana", "gram", "peas", "ulundhu", "payaru"]
    },
    "Oils & Ghee": {
      "english": ["oil", "enna", "nei", "ghee", "coco", "coconut", "vilakku", "nalla", "sunflower", "palm", "vanaspathi", "goldwinner", "sas", "idhayam", "vvd", "gems", "sunlite", "sunfure", "goldking", "daya", "tvm", "ros", "deepam", "theepam", "gingelly", "sesame", "cooking oil", "lamp oil"],
      "tamil": ["எண்ணெய்", "நெய்", "விளக்கெண்ணெய்", "நல்லெண்ணெய்", "சூரியகாந்தி", "பாமாயில்", "வனஸ்பதி", "தேங்காய் எண்ணெய்", "சமையல் எண்ணெய்", "தீபம்"],
      "tanglish": ["oil", "enna", "nei", "ghee", "coco", "coconut", "vilakku", "nalla", "sunflower", "palm", "vanaspathi", "goldwinner", "sas", "idhayam", "vvd", "gems", "sunlite", "sunfure", "goldking", "daya", "tvm", "ros", "deepam", "theepam", "gingelly", "sesame", "cooking oil", "lamp oil"]
    },
    "Spices & Masala": {
      "english": ["masala", "thool", "sambar", "chilli", "milagu", "manjal", "turmeric", "karam", "kari", "rasa", "podi", "biriyani", "biryani", "chicken", "mutton", "egg", "meen", "fish", "kuzhampu", "varuval", "milagai", "malli", "coriander", "siragam", "cumin", "perumkayam", "asafoetida", "yelakkai", "cardamom", "pattai", "cinnamon", "kirambu", "clove", "vendhayam", "fenugreek", "soombu", "fennel", "puli", "tamarind", "karipattai", "curry", "ginger", "garlic", "poondu", "inji", "pepper", "mustard", "kadugu"],
      "tamil": ["மசாலா", "தூள்", "சாம்பார்", "மிளகாய்", "மிளகு", "மஞ்சள்", "கரம்", "கறி", "ரசம்", "பொடி", "பிரியாணி", "சிக்கன்", "மட்டன்", "முட்டை", "மீன்", "குழம்பு", "வறுவல்", "மல்லி", "சீரகம்", "பெருங்காயம்", "ஏலக்காய்", "பட்டை", "கிராம்பு", "வெந்தயம்", "சோம்பு", "புளி", "கறிப்பட்டை", "இஞ்சி", "பூண்டு"],
      "tanglish": ["masala", "thool", "sambar", "chilli", "milagu", "manjal", "turmeric", "karam", "kari", "rasa", "podi", "biriyani", "biryani", "chicken", "mutton", "egg", "meen", "fish", "kuzhampu", "varuval", "milagai", "malli", "coriander", "siragam", "cumin", "perumkayam", "asafoetida", "yelakkai", "cardamom", "pattai", "cinnamon", "kirambu", "clove", "vendhayam", "fenugreek", "soombu", "fennel", "puli", "tamarind", "karipattai", "curry", "ginger", "garlic", "poondu", "inji", "pepper", "mustard", "kadugu"]
    },
    "Beverages": {
      "english": ["tea", "coffee", "boost", "horlicks", "complan", "soft drink", "cd", "cool drink", "7up", "pepsi", "bovonto", "slice", "mirinda", "coca", "fanta", "sprite", "maaza", "limca", "mountain dew", "water", "kinly", "cooldrings", "vibro", "cavins", "milkshake", "badham milk", "juice", "b natural", "soda", "panneer", "drink", "syrup", "squash"],
      "tamil": ["தேநீர்", "காபி", "பூஸ்ட்", "ஹார்லிக்ஸ்", "காம்ப்ளான்", "குளிர்பானம்", "தண்ணீர்", "ஜூஸ்", "சோடா", "பன்னீர்", "சர்பத்"],
      "tanglish": ["tea", "coffee", "boost", "horlicks", "complan", "soft drink", "cd", "cool drink", "7up", "pepsi", "bovonto", "slice", "mirinda", "coca", "fanta", "sprite", "maaza", "limca", "mountain dew", "water", "kinly", "cooldrings", "vibro", "cavins", "milkshake", "badham milk", "juice", "b natural", "soda", "panneer", "drink", "syrup", "squash"]
    },
    "Snacks & Chocolates": {
      "english": ["biscuit", "chocolate", "noodles", "yippee", "maggi", "bingo", "chips", "murukku", "michar", "pori", "soan", "papti", "laddu", "alvaa", "palcova", "cake", "rusk", "bun", "bread", "appalam", "pasta", "semiya", "vermicelli", "seeval", "banana chips", "kalla mittai", "kuchi mittai", "then mittai", "unibic", "britannia", "oreo", "dark fantasy", "treat", "wonder", "nice", "mysore", "candyman", "eclairs", "gulab jamum", "paani poori", "chat", "popcorn", "kurkure", "nuts", "badham", "pista", "dates"],
      "tamil": ["பிஸ்கட்", "சாக்லேட்", "நூடுல்ஸ்", "சிப்ஸ்", "முறுக்கு", "மிச்சர்", "பொரி", "சோன்", "லட்டு", "அல்வா", "பால்கோவா", "கேக்", "ரஸ்க்", "பன்", "பிரட்", "அப்பளம்", "பாஸ்தா", "சேமியா", "சீவல்", "வாழைக்காய் சிப்ஸ்", "கடலை மிட்டாய்", "குச்சி மிட்டாய்", "தேன் மிட்டாய்", "மைசூர் பாகு", "குலாப் ஜாமுன்", "பாணி பூரி", "சாட்", "பாப்கார்ன்"],
      "tanglish": ["biscuit", "chocolate", "noodles", "yippee", "maggi", "bingo", "chips", "murukku", "michar", "pori", "soan", "papti", "laddu", "alvaa", "palcova", "cake", "rusk", "bun", "bread", "appalam", "pasta", "semiya", "vermicelli", "seeval", "banana chips", "kalla mittai", "kuchi mittai", "then mittai", "unibic", "britannia", "oreo", "dark fantasy", "treat", "wonder", "nice", "mysore", "candyman", "eclairs", "gulab jamum", "paani poori", "chat", "popcorn", "kurkure", "nuts", "badham", "pista", "dates"]
    },
    "Personal Care": {
      "english": ["soap", "shampoo", "paste", "toothpaste", "colgate", "dabur", "closeup", "pepsodent", "brush", "hair oil", "cream", "powder", "talc", "face", "fair", "lovely", "ponds", "vasmol", "vatika", "dettol", "savlon", "nycil", "moove", "iodex", "veet", "krack", "itch", "ring", "spray", "perfume", "axe", "fogg", "ossum", "whitetone", "deodorant", "sanitizer", "blade", "shaving", "razor", "gillete", "supermax", "tiger", "balm", "mehandi", "henna", "dye"],
      "tamil": ["சோப்பு", "ஷாம்பு", "பற்பசை", "பிரஷ்", "தலை எண்ணெய்", "கிரீம்", "பவுடர்", "முகம்", "வாசனை திரவியம்", "சானிடைசர்", "பிளேடு", "ஷேவிங்", "ரேஸர்", "தைலம்", "மருதாணி"],
      "tanglish": ["soap", "shampoo", "paste", "toothpaste", "colgate", "dabur", "closeup", "pepsodent", "brush", "hair oil", "cream", "powder", "talc", "face", "fair", "lovely", "ponds", "vasmol", "vatika", "dettol", "savlon", "nycil", "moove", "iodex", "veet", "krack", "itch", "ring", "spray", "perfume", "axe", "fogg", "ossum", "whitetone", "deodorant", "sanitizer", "blade", "shaving", "razor", "gillete", "supermax", "tiger", "balm", "mehandi", "henna", "dye"]
    },
    "Household & Cleaning": {
      "english": ["detergent", "washing powder", "liquid", "dishwash", "floor cleaner", "phenyl", "bleach", "scrubber", "broom", "mop", "bucket", "plastic cover", "carry bag", "matchbox", "candle", "agarbathi", "camphor", "kungumam", "vibhuti", "sambrani", "incense", "mosquito coil", "repellent", "hit", "hunter", "allout", "goodnight", "cookoo", "odour", "room freshner", "tiles cleaner", "acid", "staino", "vim", "colin"],
      "tamil": ["சலவை", "சோப்புத்தூள்", "திரவம்", "பாத்திரங்கழுவி", "தரை சுத்தம்", "ஃபினைல்", "வெளுப்பான்", "தேய்க்கும்", "விளக்குமாறு", "துடைப்பான்", "வாளி", "கொசு", "விரட்டி"],
      "tanglish": ["detergent", "surf", "rin", "tide", "arial", "vim", "harpic", "lizol", "domex", "colin", "staino", "acid", "bleach", "cleaner", "scruper", "scourer", "exo", "steel", "liquid", "powder", "soap", "bar", "mosquito", "goodknight", "allout", "hit", "hunter", "coil", "chalk", "phenyl", "dishwash", "floor", "broom", "mop", "bucket", "scrubber"]
    },
    "Pooja Needs": {
      "english": ["agarbathi", "incense", "vaththi", "camphor", "karpooram", "soodam", "sambrani", "samrani", "viputhi", "vibhuti", "kungumam", "kumkum", "sivappu", "sandal", "santhanam", "abisegam", "sett", "pooja", "hawan", "yagna", "deepam", "lamp", "vilakku", "match", "theepetti", "lighter", "thiri", "wicks", "oil"],
      "tamil": ["ஊதுபத்தி", "கற்பூரம்", "சூடம்", "சாம்பிராணி", "விபூதி", "குங்குமம்", "சந்தனம்", "அபிஷேகம்", "பூஜை", "தீபம்", "விளக்கு", "தீக்குச்சி", "திரி"],
      "tanglish": ["agarbathi", "incense", "vaththi", "camphor", "karpooram", "soodam", "sambrani", "samrani", "viputhi", "vibhuti", "kungumam", "kumkum", "sivappu", "sandal", "santhanam", "abisegam", "sett", "pooja", "hawan", "yagna", "deepam", "lamp", "vilakku", "match", "theepetti", "lighter", "thiri", "wicks", "oil"]
    },
    "Baby Care": {
      "english": ["diapers", "pampers", "huggies", "baby", "johnsons", "himalaya", "powder", "lotion", "oil", "shampoo", "wipes", "pacifier", "cerelac", "lactogen"],
      "tamil": ["டயப்பர்கள்", "குழந்தை", "பவுடர்", "லோஷன்", "எண்ணெய்", "ஷாம்பு", "துடைப்பான்கள்"],
      "tanglish": ["diapers", "pampers", "huggies", "baby", "johnsons", "himalaya", "powder", "lotion", "oil", "shampoo", "wipes", "pacifier", "cerelac", "lactogen"]
    },
    "Dairy & Fresh": {
      "english": ["milk", "paal", "curd", "thayir", "butter", "vennai", "cheese", "paneer", "ghee", "nei", "amul", "aavin", "heritage", "milkmaker", "pediasure", "ensure", "yogurt", "lassi", "buttermilk", "more"],
      "tamil": ["பால்", "தயிர்", "வெண்ணெய்", "பாலாடைக்கட்டி", "பன்னீர்", "நெய்", "யோகர்ட்", "மோர்"],
      "tanglish": ["milk", "paal", "curd", "thayir", "butter", "vennai", "cheese", "paneer", "ghee", "nei", "amul", "aavin", "heritage", "milkmaker", "pediasure", "ensure", "yogurt", "lassi", "buttermilk", "more"]
    },
    "Stationery & Others": {
      "english": ["pen", "pencil", "eraser", "sharpner", "scale", "natraj", "apsara", "note", "paper", "book", "cover", "bag", "carry", "parcel", "battery", "bulb", "nippo", "eveready", "duracell", "mobile", "charger", "filter", "tape", "gum", "stapler", "mat", "broom", "brush", "mop", "utensil", "container", "box", "cloth", "textile", "appliance", "electronics", "tool", "hardware", "medicine", "health", "ayurvedic", "unani", "homeopathy", "surgical", "farm", "agriculture", "pet", "animal", "bird", "fish", "plant", "seed", "fertilizer", "pesticide"],
      "tamil": ["பேனா", "பென்சில்", "அழிப்பான்", "கூர்மைப்படுத்தி", "அளவுகோல்", "நோட்டு", "காகிதம்", "புத்தகம்", "உறை", "பை", "பேட்டரி", "பல்பு"],
      "tanglish": ["pen", "pencil", "eraser", "sharpner", "scale", "natraj", "apsara", "note", "paper", "book", "cover", "bag", "carry", "parcel", "battery", "bulb", "nippo", "eveready", "duracell", "mobile", "charger", "filter", "tape", "gum", "stapler"]
    }
  },
  "extraction_rules": {
    "prefixes_to_remove": ["cd", "cl", "hh", "Rs", "Rs.", "MRP", "MRP.", "liq", "bar", "soap"],
    "size_patterns": ["kg", "g", "ltr", "ml", "pcs", "ps", "pkt", "box", "jar", "bottle", "sachet", "tablet", "piece", "pack", "bundle", "bandal", "dazan", "dozen", "attai", "kattu", "saram", "no", "nos"],
    "unit_mapping": {
      "kg": "kg", "g": "g", "gm": "g", "gram": "g", 
      "ltr": "Ltr", "lit": "Ltr", "l": "Ltr", 
      "ml": "ml", 
      "pcs": "pcs", "ps": "pcs", "piece": "pcs", "no": "pcs", "nos": "pcs",
      "pkt": "pkt", "pack": "pkt", 
      "box": "box", 
      "jar": "jar", 
      "bottle": "bottle", 
      "sachet": "sachet", 
      "tablet": "tablet", 
      "bundle": "bundle", "bandal": "bundle", 
      "dazan": "dozen", "dozen": "dozen", 
      "attai": "pack", "kattu": "pack", "saram": "pack"
    }
  }
}

class GroceryEngine:
    def __init__(self, config):
        self.config = config
        self.prefixes = sorted(config['extraction_rules']['prefixes_to_remove'], key=len, reverse=True)
        self.unit_map = config['extraction_rules']['unit_mapping']
        self.units = sorted(self.unit_map.keys(), key=len, reverse=True)
        
        # Regex for size extraction
        units_regex = '|'.join([re.escape(u) for u in self.units])
        self.size_regex = re.compile(rf'(\d+(\.\d+)?)\s*({units_regex})\b', re.IGNORECASE)
        self.price_regex = re.compile(r'(rs\.?|₹)\s*\d+(\.\d+)?', re.IGNORECASE)

    def clean_text(self, text):
        if not isinstance(text, str): return ""
        text = text.strip()
        text = self.price_regex.sub('', text)
        for prefix in self.prefixes:
            pattern = re.compile(rf'\b{re.escape(prefix)}\b', re.IGNORECASE)
            text = pattern.sub('', text)
        return re.sub(r'\s+', ' ', text).strip()

    def classify(self, text):
        text_lower = text.lower()
        
        for category, kw_groups in self.config['category_keywords'].items():
            # Combine all lists (English, Tamil, Tanglish)
            all_keywords = []
            if 'english' in kw_groups: all_keywords.extend(kw_groups['english'])
            if 'tamil' in kw_groups: all_keywords.extend(kw_groups['tamil'])
            if 'tanglish' in kw_groups: all_keywords.extend(kw_groups['tanglish'])
            
            for k in all_keywords:
                k_lower = k.lower()
                # If keyword is > 3 chars, simple substring is okay. If short, strict boundary.
                if len(k_lower) > 3:
                    if k_lower in text_lower:
                        return category
                else:
                    if re.search(rf'\b{re.escape(k_lower)}\b', text_lower):
                        return category
                        
        return "Others"

    def process(self, row):
        raw_name = str(row.get('Name', ''))
        short_name = str(row.get('Short_Name', ''))
        full_text = f"{raw_name} {short_name}".strip()
        
        cleaned_text = self.clean_text(raw_name)
        
        # Extract Size/Unit
        size = 1
        unit = "pcs"
        match = self.size_regex.search(cleaned_text)
        if match:
            size = float(match.group(1))
            raw_unit = match.group(3).lower()
            unit = self.unit_map.get(raw_unit, "pcs")
            cleaned_text = cleaned_text.replace(match.group(0), "").strip()
            
        # Extract Brand
        words = cleaned_text.split()
        brand = words[0].title() if words else "Generic"
        
        # Classify
        category = self.classify(full_text)
        
        final_name = cleaned_text.title()
        final_name = re.sub(r'[^a-zA-Z0-9\s]', '', final_name).strip()
        if not final_name: final_name = raw_name

        return {
            "original_name": raw_name,
            "clean_name": final_name,
            "brand": brand,
            "size": size,
            "unit": unit,
            "category": category,
            "mrp": float(row.get('Price', 0))
        }

def main():
    input_file = "DeepSeek_Input.csv"
    output_file = "Final_Cleaned_Inventory.json"
    
    print(f"Reading {input_file}...")
    try:
        try:
            df = pd.read_csv(input_file, encoding='utf-8')
        except:
            df = pd.read_csv(input_file, encoding='latin1')
    except:
        print("❌ Error: DeepSeek_Input.csv not found.")
        return

    engine = GroceryEngine(CONFIG)
    results = []
    
    print(f"Processing {len(df)} items...")
    
    for _, row in df.iterrows():
        results.append(engine.process(row))
        
    print(f"Saving to {output_file}...")
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)

    # ==========================================
    # FINAL REPORT (THE SUMMARY)
    # ==========================================
    print("\n" + "="*40)
    print("       CATEGORY SUMMARY REPORT       ")
    print("="*40)
    
    categories = [r['category'] for r in results]
    counts = Counter(categories)
    
    # Sort for nice display
    sorted_counts = sorted(counts.items(), key=lambda x: x[1], reverse=True)
    
    total_products = len(results)
    
    for cat, count in sorted_counts:
        print(f" {cat:<25} : {count:>5} items")
        
    print("-" * 40)
    print(f" TOTAL PRODUCTS            : {total_products:>5} items")
    print("="*40 + "\n")
    print(f"✅ Full Process Complete. Data saved to {output_file}")

if __name__ == "__main__":
    main()