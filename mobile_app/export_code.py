import os

# --- CONFIGURATION ---
# Current folder where the script is running
source_folder = os.getcwd() 
output_filename = "project_code_dump.txt"

# 1. ONLY look inside these specific folders
allowed_folders = {'lib'}

# 2. ONLY include these specific files from the root folder
allowed_root_files = {'pubspec.yaml', 'analysis_options.yaml'}

# 3. ONLY include files with these extensions inside 'lib'
allowed_extensions = {'.dart'}

# --- HELPER FUNCTIONS ---

def is_allowed(path, is_dir=False):
    """
    Decides if a folder or file should be included based on your rules.
    """
    rel_path = os.path.relpath(path, source_folder)
    
    if rel_path == ".":
        return True
        
    parts = rel_path.split(os.sep)
    top_folder = parts[0]
    
    # Rule 1: If it's a folder, it must be 'lib'
    if is_dir:
        return top_folder in allowed_folders
    
    # Rule 2: If it's a file in the root, check the allowed list
    if len(parts) == 1: # File is in root
        return parts[0] in allowed_root_files
    
    # Rule 3: If it's a file inside a folder, that folder must be allowed
    if top_folder in allowed_folders:
        _, ext = os.path.splitext(parts[-1])
        return ext in allowed_extensions
        
    return False

def generate_tree(startpath):
    """
    Creates a visual text tree of the project structure.
    """
    tree_str = "PROJECT STRUCTURE:\n"
    tree_str += ".\n"
    
    for root, dirs, files in os.walk(startpath):
        # Filter directories in-place so we don't walk into 'android', 'build', etc.
        dirs[:] = [d for d in dirs if is_allowed(os.path.join(root, d), is_dir=True)]
        
        level = root.replace(startpath, '').count(os.sep)
        indent = '│   ' * (level)
        subindent = '├── '
        
        # Don't print the root "." again
        if root != startpath:
             tree_str += f"{indent[:-4]}├── {os.path.basename(root)}/\n"
        
        for f in files:
            if is_allowed(os.path.join(root, f)):
                # Adjust indent for files
                file_indent = indent if root != startpath else ""
                tree_str += f"{file_indent}{subindent}{f}\n"
                
    return tree_str

def get_file_content(filepath):
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            return f.read()
    except Exception as e:
        return f"[Error reading file: {e}]"

# --- MAIN SCRIPT ---

def main():
    print(f"Scanning: {source_folder}...")
    
    with open(output_filename, "w", encoding="utf-8") as outfile:
        
        # PART 1: WRITE THE FOLDER STRUCTURE
        tree = generate_tree(source_folder)
        outfile.write(tree)
        outfile.write("\n" + "="*60 + "\n")
        outfile.write("FILE CONTENTS START HERE\n")
        outfile.write("="*60 + "\n\n")
        
        # PART 2: WRITE THE FILE CONTENTS
        for root, dirs, files in os.walk(source_folder):
            # Filter directories again for the walker
            dirs[:] = [d for d in dirs if is_allowed(os.path.join(root, d), is_dir=True)]
            
            for file in files:
                full_path = os.path.join(root, file)
                
                if is_allowed(full_path):
                    rel_path = os.path.relpath(full_path, source_folder)
                    content = get_file_content(full_path)
                    
                    outfile.write(f"FILE: {rel_path}\n")
                    outfile.write("-" * 50 + "\n")
                    outfile.write(content)
                    outfile.write("\n" + "=" * 50 + "\n\n")
                    
                    print(f"Saved: {rel_path}")

    print(f"\n✅ SUCCESS! Structure and code saved to: {output_filename}")

if __name__ == "__main__":
    main()