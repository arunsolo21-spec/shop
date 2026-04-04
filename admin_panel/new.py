#!/usr/bin/env python3
"""
Export Admin Panel Code to Single TXT File
Excludes: node_modules, .git, dist, build, .env.local
"""

import os
import sys
from pathlib import Path
from datetime import datetime

# Configuration
SOURCE_DIR = Path(r"C:\Users\arun0\Videos\grocery_system\admin_panel")
OUTPUT_FILE = Path(r"C:\Users\arun0\Videos\grocery_system\admin_panel_export.txt")

# Folders to exclude
EXCLUDE_FOLDERS = {
    'node_modules',
    '.git',
    'dist',
    'build',
    '.vite',
    'coverage',
    '.cache',
}

# Files to exclude
EXCLUDE_FILES = {
    '.env.local',
    '.env.development.local',
    'package-lock.json',
    'npm-debug.log',
    'yarn-error.log',
    'tsconfig.tsbuildinfo',
}

# File extensions to include (None = include all)
INCLUDE_EXTENSIONS = None  # Set to {'.ts', '.tsx', '.json', '.css', '.html'} to filter

def should_include_file(file_path: Path) -> bool:
    """Check if file should be included in export."""
    # Check excluded files
    if file_path.name in EXCLUDE_FILES:
        return False
    
    # Check extensions if filter is set
    if INCLUDE_EXTENSIONS and file_path.suffix not in INCLUDE_EXTENSIONS:
        return False
    
    return True

def should_include_folder(folder_name: str) -> bool:
    """Check if folder should be traversed."""
    return folder_name not in EXCLUDE_FOLDERS

def get_tree_structure(root: Path, prefix: str = "", is_last: bool = True) -> str:
    """Generate tree structure string for a directory."""
    tree = []
    
    # Add current folder/file
    if prefix:
        connector = "└── " if is_last else "├── "
        tree.append(f"{prefix}{connector}{root.name}\n")
    else:
        tree.append(f"{root.name}/\n")
    
    if root.is_file():
        return "".join(tree)
    
    # Get sorted list of children
    try:
        children = sorted([c for c in root.iterdir() 
                          if should_include_folder(c.name) or c.is_file()],
                         key=lambda x: (x.is_file(), x.name.lower()))
    except PermissionError:
        tree.append(f"{prefix}    [Permission denied]\n")
        return "".join(tree)
    
    # Filter children
    children = [c for c in children if c.is_file() and should_include_file(c)] + \
               [c for c in children if c.is_dir() and should_include_folder(c.name)]
    
    # Add children
    new_prefix = prefix + ("    " if is_last else "│   ")
    for i, child in enumerate(children):
        is_last_child = (i == len(children) - 1)
        tree.append(get_tree_structure(child, new_prefix, is_last_child))
    
    return "".join(tree)

def get_file_content(file_path: Path) -> str:
    """Read file content with error handling."""
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
            return f"[Error reading file: {e}]"
    except Exception as e:
        return f"[Error reading file: {e}]"

def export_codebase(source: Path, output: Path):
    """Main export function."""
    print(f"🔍 Scanning: {source}")
    
    # Generate tree structure
    print("📊 Generating tree structure...")
    tree = get_tree_structure(source)
    
    # Collect file contents
    print("📄 Collecting file contents...")
    file_contents = []
    file_count = 0
    total_size = 0
    
    for root, dirs, files in os.walk(source):
        # Filter excluded folders
        dirs[:] = [d for d in dirs if should_include_folder(d)]
        
        root_path = Path(root)
        
        for file in files:
            file_path = root_path / file
            
            if not should_include_file(file_path):
                continue
            
            file_count += 1
            relative_path = file_path.relative_to(source)
            content = get_file_content(file_path)
            file_size = file_path.stat().st_size
            total_size += file_size
            
            file_contents.append({
                'path': str(relative_path).replace('\\', '/'),
                'size': file_size,
                'content': content
            })
            
            if file_count % 50 == 0:
                print(f"   Processed {file_count} files...")
    
    # Write output file
    print(f"✍️  Writing to: {output}")
    
    with open(output, 'w', encoding='utf-8') as f:
        # Header
        f.write("=" * 80 + "\n")
        f.write("FRESHMART ADMIN PANEL - CODE EXPORT\n")
        f.write("=" * 80 + "\n")
        f.write(f"Export Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write(f"Source: {source}\n")
        f.write(f"Total Files: {file_count}\n")
        f.write(f"Total Size: {total_size / 1024 / 1024:.2f} MB\n")
        f.write(f"Excluded Folders: {', '.join(EXCLUDE_FOLDERS)}\n")
        f.write("=" * 80 + "\n\n")
        
        # Tree structure
        f.write("📁 FOLDER STRUCTURE\n")
        f.write("-" * 80 + "\n")
        f.write(tree)
        f.write("\n" + "=" * 80 + "\n\n")
        
        # File contents
        f.write("📄 FILE CONTENTS\n")
        f.write("-" * 80 + "\n\n")
        
        for file_info in file_contents:
            f.write(f"{'=' * 80}\n")
            f.write(f"FILE_PATH: {file_info['path']}\n")
            f.write(f"SIZE: {file_info['size']} bytes\n")
            f.write(f"{'-' * 80}\n")
            f.write(file_info['content'])
            f.write("\n\n")
    
    print(f"✅ Export complete!")
    print(f"   Files exported: {file_count}")
    print(f"   Output file: {output}")
    print(f"   Output size: {output.stat().st_size / 1024 / 1024:.2f} MB")

def main():
    """Entry point."""
    if not SOURCE_DIR.exists():
        print(f"❌ Error: Source directory not found: {SOURCE_DIR}")
        sys.exit(1)
    
    # Create output directory if needed
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    
    try:
        export_codebase(SOURCE_DIR, OUTPUT_FILE)
    except Exception as e:
        print(f"❌ Error during export: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()