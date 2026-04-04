import json
import re

def clean_oils_ghee_data(input_file_path, output_file_path):
    with open(input_file_path, 'r', encoding='utf-8') as f:
        raw_data = json.load(f)

    cleaned_data = []

    for item in raw_data:
        original_name = item.get('original_name', '')
        mrp = float(item.get('mrp', 0))

        # 1. Advanced Name Cleaning
        name = original_name
        name = re.sub(r'Rs\.?\s*\d+(\.\d+)?', '', name, flags=re.IGNORECASE)
        name = re.sub(r'\d+\s*rs', '', name, flags=re.IGNORECASE)
        name = re.sub(r'\(?saram\)?', '', name, flags=re.IGNORECASE)
        name = re.sub(r'\(?box\)?', '', name, flags=re.IGNORECASE)
        name = re.sub(r'\(?case\)?', '', name, flags=re.IGNORECASE)
        name = re.sub(r'\(?pkt\)?', '', name, flags=re.IGNORECASE)
        name = re.sub(r'1\.?lit', '1 L', name, flags=re.IGNORECASE)
        name = re.sub(r'1\.?ltr', '1 L', name, flags=re.IGNORECASE)
        name = re.sub(r'1/2\s*ltr', '500 ml', name, flags=re.IGNORECASE)
        name = re.sub(r'\d+ml', '', name, flags=re.IGNORECASE)
        name = re.sub(r'\d+g', '', name, flags=re.IGNORECASE)
        name = re.sub(r'\d+pcs', '', name, flags=re.IGNORECASE)
        
        # Specific typo fixes
        name = re.sub(r'ennaie', 'Ennai', name, flags=re.IGNORECASE)
        name = re.sub(r'ennai', 'Ennai', name, flags=re.IGNORECASE)
        name = re.sub(r'nei', 'Ghee', name, flags=re.IGNORECASE)
        name = re.sub(r'coco\.oil', 'Coconut Oil', name, flags=re.IGNORECASE)
        name = re.sub(r'hair\.oil', 'Hair Oil', name, flags=re.IGNORECASE)
        name = re.sub(r'goldwinner', 'Gold Winner', name, flags=re.IGNORECASE)
        name = re.sub(r'vilakku', 'Vilakku', name, flags=re.IGNORECASE)
        name = re.sub(r'theepam', 'Deepam', name, flags=re.IGNORECASE)
        name = re.sub(r'deepam', 'Deepam', name, flags=re.IGNORECASE)
        name = re.sub(r'nallennai', 'Gingelly Oil', name, flags=re.IGNORECASE)
        name = re.sub(r'kadalai', 'Groundnut', name, flags=re.IGNORECASE)
        name = re.sub(r'ma\.ennai', 'Maa Vilakku Ennai', name, flags=re.IGNORECASE)
        
        # Remove generic 'oil' prefix if it exists at the start
        name = re.sub(r'^oil\s+', '', name, flags=re.IGNORECASE)

        clean_name = name.strip()
        name_lower = clean_name.lower()
        
        brand = "Generic"
        category = "Cooking Oils" # Default
        tamil_tags = []
        
        # 2. Precise Categorization & Brand Prediction
        
        # --- COOKING OILS ---
        if 'gold winner' in name_lower:
            brand = "Gold Winner"
            category = "Cooking Oils"
            if 'sunflower' not in name_lower: clean_name = f"Gold Winner Sunflower Oil"
            tamil_tags.extend(["sunflower oil", "refined oil", "சூரியகாந்தி எண்ணெய்"])

        elif 'fortune' in name_lower:
            brand = "Fortune"
            category = "Cooking Oils"
            tamil_tags.extend(["fortune", "sunflower oil", "சூரியகாந்தி எண்ணெய்"])

        elif 'idhayam' in name_lower:
            brand = "Idhayam"
            category = "Cooking Oils"
            if 'gingelly' not in name_lower and 'nallennai' not in name_lower:
                clean_name = f"Idhayam Gingelly Oil"
            tamil_tags.extend(["gingelly oil", "sesame oil", "nallennai", "நல்லெண்ணெய்", "இதயம்"])

        elif 'vvd' in name_lower:
            brand = "VVD"
            clean_name = clean_name.replace('Vvd', 'VVD')
            if 'gold' in name_lower: clean_name = clean_name.replace('Gold', 'Gold')
            category = "Cooking Oils" # Primarily coconut oil
            tamil_tags.extend(["coconut oil", "thengai ennai", "தேங்காய் எண்ணெய்"])
            
        elif 'sas ' in name_lower or 'sastha' in name_lower:
            brand = "Sastha"
            category = "Cooking Oils"
            if 'nallennai' in name_lower or 'gingelly' in name_lower:
                clean_name = "Sastha Gingelly Oil"
                tamil_tags.extend(["gingelly oil", "nallennai", "நல்லெண்ணெய்"])
            elif 'groundnut' in name_lower or 'kadalai' in name_lower:
                clean_name = "Sastha Groundnut Oil"
                tamil_tags.extend(["groundnut oil", "peanut oil", "kadalai ennai", "கடலை எண்ணெய்"])
            else:
                clean_name = "Sastha Refined Oil"

        elif 'sunland' in name_lower:
            brand = "Sunland"
            category = "Cooking Oils"
            tamil_tags.extend(["sunflower oil", "சூரியகாந்தி எண்ணெய்"])

        # --- GHEE ---
        elif 'udhayakrishna' in name_lower or 'udhayakiru' in name_lower or 'krishna' in name_lower:
            brand = "Udhaya Krishna"
            category = "Ghee"
            clean_name = "Udhaya Krishna Ghee"
            tamil_tags.extend(["ghee", "nei", "pure ghee", "நெய்", "உதயகிருஷ்ணா"])

        elif 'aavin' in name_lower:
            brand = "Aavin"
            category = "Ghee"
            if 'ghee' in name_lower or 'nei' in name_lower:
                clean_name = "Aavin Ghee"
            tamil_tags.extend(["ghee", "nei", "நெய்", "ஆவின்"])

        elif 'grb' in name_lower:
            brand = "GRB"
            category = "Ghee"
            tamil_tags.extend(["ghee", "nei", "நெய்"])

        elif 'rkg' in name_lower:
            brand = "RKG"
            category = "Ghee"
            tamil_tags.extend(["ghee", "nei", "நெய்"])

        # --- HAIR CARE ---
        elif 'parachute' in name_lower:
            brand = "Parachute"
            category = "Hair Care"
            tamil_tags.extend(["coconut oil", "hair oil", "தலைக்கு எண்ணெய்"])

        elif 'dabur' in name_lower and 'amla' in name_lower:
            brand = "Dabur Amla"
            category = "Hair Care"
            tamil_tags.extend(["amla oil", "hair oil", "நெல்லிக்காய் எண்ணெய்"])

        elif 'vasmol' in name_lower:
            brand = "Vasmol"
            category = "Hair Care"
            tamil_tags.extend(["hair oil", "black hair", "வாஸ்மோல்"])

        elif 'vatika' in name_lower:
            brand = "Vatika"
            category = "Hair Care"
            tamil_tags.extend(["hair oil", "வாடிகா"])

        # --- POOJA OILS ---
        elif 'deepam' in name_lower or 'vilakku' in name_lower or 'pooja' in name_lower or 'ma.ennai' in name_lower:
            brand = "Deepam"
            category = "Pooja Needs"
            if 'ma.ennai' in name_lower: clean_name = "Maa Vilakku Ennai"
            else: clean_name = "Deepam Lamp Oil"
            tamil_tags.extend(["lamp oil", "vilakku ennai", "pooja oil", "விளக்கு எண்ணெய்", "தீபம்"])

        # --- GENERIC CATEGORIZATION ---
        elif 'groundnut' in name_lower:
             category = "Cooking Oils"
             tamil_tags.extend(["groundnut oil", "kadalai ennai", "கடலை எண்ணெய்"])
        elif 'gingelly' in name_lower:
             category = "Cooking Oils"
             tamil_tags.extend(["gingelly oil", "sesame oil", "nallennai", "நல்லெண்ணெய்"])
        elif 'mustard' in name_lower:
             category = "Cooking Oils"
             tamil_tags.extend(["mustard oil", "kadugu ennai", "கடுகு எண்ணெய்"])

        # 3. Final Name Formatting
        final_name = re.sub(r'\s+', ' ', clean_name).strip()
        final_name = final_name.title()

        # 4. Variant Formatting
        size = item.get('size', 1)
        unit = item.get('unit', 'L')
        if isinstance(size, float) and size.is_integer():
            size = int(size)
        variant = f"{size} {unit}"

        # 5. Pricing (MRP as Price, No Discount)
        selling_price = int(mrp)
        
        # 6. Description
        description = f"Pure and high-quality {final_name}."
        if category == "Cooking Oils":
            description = f"Healthy {final_name}, perfect for your daily cooking needs."
        elif category == "Ghee":
            description = f"Aromatic and traditional {final_name} with rich taste."
        elif category == "Hair Care":
            description = f"Nourishing {final_name} for strong and healthy hair."
        elif category == "Pooja Needs":
            description = f"Traditional {final_name} for a divine and peaceful pooja."

        # 7. Image Path
        category_slug = category.lower().replace(' & ', '_').replace(' ', '_')
        snake_name = re.sub(r'[^a-z0-9]', '_', final_name.lower())
        snake_name = re.sub(r'_+', '_', snake_name).strip('_')
        image_url = f"assets/images/products/{category_slug}/{snake_name}.png"

        tags = [final_name.lower(), brand.lower(), category.lower()] + tamil_tags

        product = {
            "name": final_name,
            "description": description,
            "brand": brand,
            "category": category,
            "variant": variant,
            "price": selling_price,
            "in_stock": True,
            "is_featured": False,
            "image_url": image_url,
            "search_tags": list(set(tags))
        }

        cleaned_data.append(product)

    with open(output_file_path, 'w', encoding='utf-8') as f:
        json.dump(cleaned_data, f, indent=2, ensure_ascii=False)

    print(f"Successfully processed {len(cleaned_data)} items.")

clean_oils_ghee_data('oils_&_ghee.json', 'cleaned_oils_ghee.json')