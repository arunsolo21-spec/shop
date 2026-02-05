import os

def generate_clean_project_summary(root_path, output_file):
    # 1. EXPANDED IGNORE LIST (Removes dist, build, and hidden tools)
    ignore_folders = {
        'node_modules', '.dart_tool', '.git', '.idea', '.vscode', 
        'build', 'ios', 'android', 'linux', 'macos', 'windows', 
        'web', 'test', 'dist', 'coverage', '.fvm'
    }

    # 2. FILE EXCLUSIONS (Removes lock files and system files)
    ignore_files = {
        'package-lock.json', 'yarn.lock', 'pubspec.lock', 
        '.DS_Store', 'analysis_options.yaml', 'thumbs.db'
    }
    
    # 3. ALLOWED EXTENSIONS (Only source code)
    # Note: We exclude .js usually if using TypeScript, but keep it if specific config needs it.
    # For NestJS + Flutter, we prioritize .ts and .dart.
    valid_extensions = {'.dart', '.yaml', '.json', '.ts', '.env', '.prisma', '.html', '.css'}

    with open(output_file, 'w', encoding='utf-8') as f:
        f.write("=== REFINED PROJECT STRUCTURE ===\n\n")
        
        # --- GENERATE STRUCTURE TREE ---
        for root, dirs, files in os.walk(root_path):
            # Modify dirs in-place to skip ignored folders
            dirs[:] = [d for d in dirs if d not in ignore_folders]
            
            level = root.replace(root_path, '').count(os.sep)
            indent = ' ' * 4 * level
            f.write(f"{indent}{os.path.basename(root)}/\n")
            
            sub_indent = ' ' * 4 * (level + 1)
            for file in files:
                # Skip ignored files specifically
                if file in ignore_files:
                    continue
                # Skip compiled JS/Map files in backend if TS exists
                if file.endswith('.js') or file.endswith('.d.ts') or file.endswith('.map'):
                    continue
                
                if any(file.endswith(ext) for ext in valid_extensions):
                    f.write(f"{sub_indent}{file}\n")

        f.write("\n\n=== REFINED SOURCE CODE ===\n")
        
        # --- GENERATE CODE CONTENT ---
        for root, dirs, files in os.walk(root_path):
            dirs[:] = [d for d in dirs if d not in ignore_folders]
            
            for file in files:
                # Apply same strict filtering
                if file in ignore_files:
                    continue
                if file.endswith('.js') or file.endswith('.d.ts') or file.endswith('.map'):
                    continue
                
                if any(file.endswith(ext) for ext in valid_extensions):
                    file_path = os.path.join(root, file)
                    relative_path = os.path.relpath(file_path, root_path)
                    
                    f.write("\n" + "="*50 + "\n")
                    f.write(f"FILE: {relative_path}\n")
                    f.write("="*50 + "\n\n")
                    
                    try:
                        with open(file_path, 'r', encoding='utf-8') as code_file:
                            f.write(code_file.read())
                    except Exception as e:
                        f.write(f"[Error reading file: {e}]\n")
                    f.write("\n")

if __name__ == "__main__":
    # PASTE YOUR FOLDER PATH HERE
    target_folder = r"C:\Users\arun0\Videos\grocery_system"
    output_name = "refined_grocery_code.txt"
    
    if os.path.exists(target_folder):
        generate_clean_project_summary(target_folder, output_name)
        print(f"Success! Clean code saved to: {output_name}")
    else:
        print("Error: Folder path not found.")