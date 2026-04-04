#!/usr/bin/env python3
"""
Extract Essential Backend Code for AI Upload
Excludes: node_modules, dist, large JSON files, images, logs
"""
import os
from pathlib import Path
from datetime import datetime

# Configuration
SOURCE_DIR = Path(r"C:\Users\arun0\Videos\grocery_system\backend")
OUTPUT_FILE = Path(r"C:\Users\arun0\Videos\grocery_system\backend_code_for_ai.txt")

# Folders to EXCLUDE completely
EXCLUDE_FOLDERS = {
    'node_modules',
    'dist',
    '.git',
    '.cache',
    'coverage',
    '.vscode',
    '.idea',
    'public',  # Images folder
}

# Files to EXCLUDE
EXCLUDE_FILES = {
    'package-lock.json',
    'npm-debug.log',
    'yarn-error.log',
    'tsconfig.tsbuildinfo',
    '.env',
    '.env.local',
    '.env.development.local',
    'master_product_database.json',
    'master_products_final.json',
    'master_products_merged.json',
}

# File extensions to INCLUDE (only code files)
INCLUDE_EXTENSIONS = {
    '.ts',           # TypeScript
    '.json',         # Config files
    '.prisma',       # Prisma schema
    '.md',           # Documentation
    '.gitignore',
    '.env.example',
}

def should_include_file(file_path: Path) -> bool:
    """Check if file should be included."""
    # Exclude specific filenames
    if file_path.name in EXCLUDE_FILES:
        return False
    
    # Only include specific extensions
    if file_path.suffix not in INCLUDE_EXTENSIONS and file_path.name not in ['.gitignore', '.env.example']:
        return False
    
    # Skip large JSON files (except config)
    if file_path.suffix == '.json':
        try:
            if file_path.stat().st_size > 100 * 1024:  # Skip JSON > 100KB
                return False
        except:
            pass
    
    return True

def should_include_folder(folder_name: str, folder_path: Path) -> bool:
    """Check if folder should be traversed."""
    if folder_name in EXCLUDE_FOLDERS:
        return False
    
    # Skip prisma/seeds folder (contains large JSON)
    if 'prisma\\seeds' in str(folder_path):
        return False
    
    return True

def get_file_content(file_path: Path) -> str:
    """Read file content with error handling."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()
    except UnicodeDecodeError:
        try:
            with open(file_path, 'r', encoding='latin-1') as f:
                return f.read()
        except:
            return "[Error: Could not read file]"
    except Exception as e:
        return f"[Error: {str(e)}]"

def extract_code():
    """Main extraction function."""
    print(f"🔍 Scanning: {SOURCE_DIR}")
    
    files_collected = []
    total_size = 0
    excluded_count = 0
    
    # Walk through directory
    for root, dirs, files in os.walk(SOURCE_DIR):
        # Filter folders
        dirs[:] = [d for d in dirs if should_include_folder(d, Path(root) / d)]
        
        root_path = Path(root)
        for file in files:
            file_path = root_path / file
            
            if not should_include_file(file_path):
                excluded_count += 1
                continue
            
            try:
                relative_path = file_path.relative_to(SOURCE_DIR)
                content = get_file_content(file_path)
                file_size = file_path.stat().st_size
                
                files_collected.append({
                    'path': str(relative_path).replace('\\', '/'),
                    'size': file_size,
                    'content': content
                })
                total_size += file_size
                
                if len(files_collected) % 20 == 0:
                    print(f"   Collected {len(files_collected)} files...")
                    
            except Exception as e:
                print(f"   ⚠️  Error reading {file_path}: {e}")
                excluded_count += 1
    
    # Sort files by path
    files_collected.sort(key=lambda x: x['path'])
    
    # Write to output file
    print(f"\n✍️  Writing to: {OUTPUT_FILE}")
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        # Header
        f.write("=" * 80 + "\n")
        f.write("FRESHMART BACKEND - ESSENTIAL CODE FOR AI\n")
        f.write("=" * 80 + "\n")
        f.write(f"Export Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write(f"Source: {SOURCE_DIR}\n")
        f.write(f"Total Files: {len(files_collected)}\n")
        f.write(f"Total Size: {total_size / 1024 / 1024:.2f} MB\n")
        f.write(f"Excluded Files: {excluded_count}\n")
        f.write(f"Excluded Folders: {', '.join(EXCLUDE_FOLDERS)}\n")
        f.write("=" * 80 + "\n\n")
        
        # File tree
        f.write("📁 FILE STRUCTURE\n")
        f.write("-" * 80 + "\n")
        for file_info in files_collected:
            f.write(f"   {file_info['path']}\n")
        f.write("\n" + "=" * 80 + "\n\n")
        
        # File contents
        f.write("📄 FILE CONTENTS\n")
        f.write("-" * 80 + "\n\n")
        
        for file_info in files_collected:
            f.write(f"{'=' * 80}\n")
            f.write(f"FILE_PATH: {file_info['path']}\n")
            f.write(f"SIZE: {file_info['size']} bytes\n")
            f.write(f"{'-' * 80}\n")
            f.write(file_info['content'])
            f.write("\n\n")
    
    print(f"\n✅ Export complete!")
    print(f"   Files exported: {len(files_collected)}")
    print(f"   Files excluded: {excluded_count}")
    print(f"   Output file: {OUTPUT_FILE}")
    print(f"   Output size: {OUTPUT_FILE.stat().st_size / 1024 / 1024:.2f} MB")
    print(f"\n💡 This file is optimized for AI upload!")

if __name__ == "__main__":
    extract_code()