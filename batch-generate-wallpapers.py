import subprocess
import json

with open('wallpapers.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Get the 19 new wallpapers (those with slugs we just added)
new_ids = [
    'wallpaper_1780968441',
    'wallpaper_1780968392',
    'wallpaper_1780968337',
    'wallpaper_1780968271',
    'wallpaper_1780968221',
    'wallpaper_1780968177',
    'wallpaper_1780968131',
    'wallpaper_1780968080',
    'wallpaper_1780968034',
    'wallpaper_1780967982',
    'wallpaper_1780967921',
    'wallpaper_1780967857',
    'wallpaper_1780967800',
    'wallpaper_1780967747',
    'wallpaper_1780967695',
    'wallpaper_1780967642',
    'wallpaper_1780967582',
    'wallpaper_1780967322',
    'wallpaper_1780967246'
]

print(f"Generating {len(new_ids)} wallpaper pages...\n")

success = 0
failed = []

for wid in new_ids:
    print(f"Generating {wid}...")
    result = subprocess.run(
        ['node', 'scripts/generate-wallpapers.cjs', f'--id={wid}'],
        capture_output=True,
        text=True,
        timeout=60,
        encoding='utf-8',
        errors='replace'
    )
    
    if result.returncode == 0:
        success += 1
        print(f"  [OK] {wid} done")
    else:
        failed.append(wid)
        print(f"  [FAIL] {wid} failed")
        # Print last 5 lines of stderr
        err_lines = result.stderr.strip().split('\n')[-5:]
        for line in err_lines:
            print(f"    {line}")

print(f"\n{'='*60}")
print(f"Results: {success}/{len(new_ids)} success")

if failed:
    print(f"\nFailed IDs:")
    for wid in failed:
        print(f"  - {wid}")
