# export_mobile_app.py
import os
from pathlib import Path
from datetime import datetime

SOURCE = Path(r"C:\Users\arun0\Videos\grocery_system\mobile_app")
OUTPUT = Path(r"C:\Users\arun0\Videos\grocery_system\mobile_app_code.txt")

def export_dart_files():
    with open(OUTPUT, 'w', encoding='utf-8') as f:
        f.write(f"=== FRESHMART MOBILE APP - DART SOURCE ===\n")
        f.write(f"Exported: {datetime.now()}\n\n")
        
        for root, dirs, files in os.walk(SOURCE):
            # Skip build artifacts
            dirs[:] = [d for d in dirs if d not in {
                'build', '.dart_tool', 'android', 'ios', 
                'macos', 'linux', 'windows', 'web'
            }]
            
            for file in files:
                if file.endswith('.dart'):
                    file_path = Path(root) / file
                    rel_path = file_path.relative_to(SOURCE)
                    
                    try:
                        content = file_path.read_text(encoding='utf-8')
                        f.write(f"\n{'='*80}\n")
                        f.write(f"FILE: {rel_path}\n")
                        f.write(f"{'='*80}\n")
                        f.write(content + "\n")
                    except Exception as e:
                        f.write(f"\n[Error reading {rel_path}: {e}]\n")
    
    print(f"✅ Exported to: {OUTPUT}")

if __name__ == "__main__":
    export_dart_files()