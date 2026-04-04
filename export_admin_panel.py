import os
from pathlib import Path
from datetime import datetime

# ==================== CONFIGURATION ====================
ADMIN_PANEL_PATH = r"C:\Users\arun0\Videos\grocery_system\admin_panel"
OUTPUT_FILE = r"C:\Users\arun0\Videos\grocery_system\admin_panel_export.txt"

# Folders to exclude
EXCLUDE_FOLDERS = {
    'node_modules',
    'public',
    '.git',
    '.vscode',
    'dist',
    'build',
    '.cache'
}

# Files to exclude
EXCLUDE_FILES = {
    '.gitignore',
    '.env',
    '.env.local',
    'package-lock.json',
    'yarn.lock',
    'pnpm-lock.yaml',
    'tsconfig.node.json',
    'vite.config.ts',
    'postcss.config.js'
}

# File extensions to include (code files only)
INCLUDE_EXTENSIONS = {
    '.ts', '.tsx', '.js', '.jsx',
    '.css', '.scss', '.sass', '.less',
    '.html', '.json', '.md', '.txt',
    '.yaml', '.yml', '.env.example'
}

# ==================== HELPER FUNCTIONS ====================

def should_exclude_folder(folder_name: str) -> bool:
    """Check if folder should be excluded"""
    return folder_name in EXCLUDE_FOLDERS or folder_name.startswith('.')

def should_exclude_file(file_name: str) -> bool:
    """Check if file should be excluded"""
    return file_name in EXCLUDE_FILES or file_name.startswith('.')

def should_include_file(file_name: str) -> bool:
    """Check if file extension should be included"""
    ext = Path(file_name).suffix.lower()
    return ext in INCLUDE_EXTENSIONS or ext == ''

def get_tree_structure(root_path: str, exclude_folders: set) -> str:
    """Generate directory tree structure"""
    tree_lines = []
    
    def add_to_tree(current_path: str, prefix: str = ""):
        try:
            items = sorted(os.listdir(current_path))
        except PermissionError:
            return
        
        # Filter out excluded items
        items = [
            item for item in items 
            if not should_exclude_folder(item)
        ]
        
        files = []
        folders = []
        
        for item in items:
            item_path = os.path.join(current_path, item)
            if os.path.isdir(item_path):
                folders.append(item)
            else:
                if should_include_file(item) and not should_exclude_file(item):
                    files.append(item)
        
        # Add folders first
        for i, folder in enumerate(folders):
            is_last = (i == len(folders) - 1) and (len(files) == 0)
            connector = "└── " if is_last else "├── "
            tree_lines.append(f"{prefix}{connector}{folder}/")
            
            next_prefix = prefix + ("    " if is_last else "│   ")
            add_to_tree(os.path.join(current_path, folder), next_prefix)
        
        # Add files
        for i, file in enumerate(files):
            is_last = (i == len(files) - 1)
            connector = "└── " if is_last else "├── "
            tree_lines.append(f"{prefix}{connector}{file}")
    
    root_name = os.path.basename(root_path)
    tree_lines.append(f"{root_name}/")
    add_to_tree(root_path, "")
    
    return "\n".join(tree_lines)

def get_file_content(file_path: str) -> str:
    """Read file content with error handling"""
    try:
        # Try UTF-8 first
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()
    except UnicodeDecodeError:
        try:
            # Fallback to latin-1
            with open(file_path, 'r', encoding='latin-1') as f:
                return f.read()
        except Exception as e:
            return f"[ERROR: Could not read file - {str(e)}]"
    except Exception as e:
        return f"[ERROR: {str(e)}]"

def export_admin_panel():
    """Main export function"""
    print("=" * 80)
    print("🚀 FRESHMART ADMIN PANEL - CODE EXPORTER")
    print("=" * 80)
    print(f"\n📁 Source: {ADMIN_PANEL_PATH}")
    print(f"📄 Output: {OUTPUT_FILE}")
    print(f"⏰ Time:  {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("\n" + "=" * 80)
    
    # Validate source path
    if not os.path.exists(ADMIN_PANEL_PATH):
        print(f"❌ ERROR: Admin panel path does not exist: {ADMIN_PANEL_PATH}")
        return
    
    # Collect all files
    all_files = []
    total_size = 0
    file_count = 0
    
    print("\n🔍 Scanning files...")
    
    for root, dirs, files in os.walk(ADMIN_PANEL_PATH):
        # Remove excluded folders from dirs (modifies in-place)
        dirs[:] = [
            d for d in dirs 
            if not should_exclude_folder(d)
        ]
        
        for file in files:
            if should_exclude_file(file):
                continue
            
            if not should_include_file(file):
                continue
            
            file_path = os.path.join(root, file)
            rel_path = os.path.relpath(file_path, ADMIN_PANEL_PATH)
            
            try:
                file_size = os.path.getsize(file_path)
                total_size += file_size
                file_count += 1
                all_files.append({
                    'path': file_path,
                    'relative_path': rel_path,
                    'size': file_size
                })
            except Exception as e:
                print(f"⚠️  Warning: Could not access {rel_path} - {str(e)}")
    
    print(f"✅ Found {file_count} files ({total_size / 1024:.2f} KB)")
    
    # Generate tree structure
    print("\n🌳 Generating directory tree...")
    tree_structure = get_tree_structure(ADMIN_PANEL_PATH, EXCLUDE_FOLDERS)
    
    # Write to output file
    print("\n📝 Writing export file...")
    
    try:
        with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
            # Header
            f.write("=" * 80 + "\n")
            f.write("FRESHMART ADMIN PANEL - COMPLETE SOURCE CODE EXPORT\n")
            f.write("=" * 80 + "\n")
            f.write(f"Export Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write(f"Source Path: {ADMIN_PANEL_PATH}\n")
            f.write(f"Total Files: {file_count}\n")
            f.write(f"Total Size:  {total_size / 1024:.2f} KB\n")
            f.write(f"Excluded Folders: {', '.join(EXCLUDE_FOLDERS)}\n")
            f.write(f"Excluded Files: {', '.join(EXCLUDE_FILES)}\n")
            f.write("=" * 80 + "\n\n")
            
            # Directory Tree
            f.write("📁 FOLDER STRUCTURE\n")
            f.write("-" * 80 + "\n")
            f.write(tree_structure)
            f.write("\n\n")
            
            # File Contents
            f.write("=" * 80 + "\n")
            f.write("📄 FILE CONTENTS\n")
            f.write("=" * 80 + "\n\n")
            
            # Sort files by path for consistent output
            all_files.sort(key=lambda x: x['relative_path'])
            
            for i, file_info in enumerate(all_files, 1):
                f.write("-" * 80 + "\n")
                f.write(f"FILE #{i}/{file_count}\n")
                f.write(f"PATH: {file_info['relative_path']}\n")
                f.write(f"SIZE: {file_info['size']} bytes\n")
                f.write("-" * 80 + "\n\n")
                
                content = get_file_content(file_info['path'])
                f.write(content)
                f.write("\n\n")
                
                # Progress indicator
                if i % 10 == 0:
                    print(f"   📄 Processed {i}/{file_count} files...")
        
        print(f"\n✅ Export completed successfully!")
        print(f"📊 Summary:")
        print(f"   • Total Files: {file_count}")
        print(f"   • Total Size:  {total_size / 1024:.2f} KB")
        print(f"   • Output File: {OUTPUT_FILE}")
        print(f"\n💡 Tip: Open the output file in VS Code or Notepad++")
        
    except Exception as e:
        print(f"\n❌ ERROR: Failed to write export file - {str(e)}")
        return
    
    print("\n" + "=" * 80)
    print("✨ EXPORT COMPLETE!")
    print("=" * 80)

# ==================== RUN EXPORT ====================

if __name__ == "__main__":
    export_admin_panel()