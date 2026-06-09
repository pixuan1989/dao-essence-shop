import os, re

wallpaper_dir = 'wallpaper'
fixed = 0
already_ok = 0

for slug in sorted(os.listdir(wallpaper_dir)):
    dir_path = os.path.join(wallpaper_dir, slug)
    if not os.path.isdir(dir_path):
        continue
    index_path = os.path.join(dir_path, 'index.html')
    if not os.path.exists(index_path):
        continue
    
    with open(index_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check if main-image has loading="lazy"
    if 'id="main-image"' in content and 'loading="lazy"' in content:
        # Remove loading="lazy" only from the main-image tag
        new_content = re.sub(
            r'(<img id="main-image"[^>]*?) loading="lazy"([^>]*?>)',
            r'\1\2',
            content
        )
        if new_content != content:
            with open(index_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            fixed += 1
            print(f'  ✓ Fixed: {slug}')
        else:
            print(f'  ✗ Could not fix: {slug}')
    else:
        already_ok += 1

print(f'\nDone: {fixed} files fixed, {already_ok} already OK')
