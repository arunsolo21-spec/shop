import os
import re

def standardize_images():
    # Configuration
    folder_path = r"C:\Users\arun0\Videos\grocery_system\mobile_app\assets\images\subcategories"
    
    # Typo corrections (lowercase source -> target)
    typo_map = {
        "biscust": "biscuits",
        "beverges": "beverages",
        "noddles": "noodles",
        "chilly": "spices"
    }

    print(f"Scanning folder: {folder_path}\n")

    if not os.path.exists(folder_path):
        print("Error: Folder path does not exist.")
        return

    # List all files
    files = os.listdir(folder_path)
    
    for filename in files:
        # 5. Keep .png extension (process only pngs)
        if not filename.lower().endswith(".png"):
            continue

        name, ext = os.path.splitext(filename)
        
        # 1. Convert to lowercase
        new_name = name.lower()
        
        # 3. Fix common typos (Checking exact match on the name part)
        if new_name in typo_map:
            new_name = typo_map[new_name]
        
        # 2. Replace spaces with underscores
        new_name = new_name.replace(" ", "_")
        
        # 4. Remove special characters (& - etc), keep alphanumeric and underscores
        # We strip out anything that isn't a-z, 0-9, or _
        new_name = re.sub(r'[^a-z0-9_]', '', new_name)
        
        # Reassemble filename
        new_filename = f"{new_name}{ext.lower()}"
        
        old_file_path = os.path.join(folder_path, filename)
        new_file_path = os.path.join(folder_path, new_filename)

        # Skip if name remains unchanged
        if old_file_path == new_file_path:
            continue

        # 6. Do NOT overwrite duplicates
        # Check if target exists AND it's not just a case-sensitive rename of the same file
        if os.path.exists(new_file_path) and old_file_path.lower() != new_file_path.lower():
            base, extension = os.path.splitext(new_filename)
            counter = 1
            while os.path.exists(new_file_path):
                new_file_path = os.path.join(folder_path, f"{base}_{counter}{extension}")
                counter += 1
            new_filename = os.path.basename(new_file_path)

        # 9. Safe rename
        try:
            os.rename(old_file_path, new_file_path)
            print(f"Renamed: '{filename}' -> '{new_filename}'")
        except OSError as e:
            print(f"Error renaming '{filename}': {e}")

    print("\nRename process complete.")

if __name__ == "__main__":
    standardize_images()