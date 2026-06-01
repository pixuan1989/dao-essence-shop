import urllib.request
import json

# Try to fetch the deployed Vercel URL
url = 'https://daoessence-shop-lqeai7v6m-daodao-74dfe427.vercel.app/wallpaper-detail?id=wallpaper_1780233504'

try:
    req = urllib.request.Request(url, headers={
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    })
    resp = urllib.request.urlopen(req, timeout=15)
    html = resp.read().decode('utf-8')
    
    print('Successfully fetched Vercel deployment')
    print('HTML length:', len(html))
    print()
    
    # Check key markers
    markers = {
        'wp-data': 'wp-data' in html,
        'DOMContentLoaded': 'DOMContentLoaded' in html,
        'onerror': 'onerror' in html,
        'renderRelated(index)': 'renderRelated(index)' in html,
        'Lucky Wallpaper': 'Lucky Wallpaper' in html,
        'Warm Golden': 'Warm Golden' in html,
    }
    
    for k, v in markers.items():
        print(f'{k}: {"YES" if v else "NO"}')
    
    # Write full HTML for manual inspection
    with open(r'C:\Users\agenew\Desktop\DaoEssence1.0\vercel_deployed.html', 'w', encoding='utf-8') as f:
        f.write(html)
    print('\nFull HTML saved to vercel_deployed.html')
    
except Exception as e:
    print(f'Error: {e}')
    print('Vercel deployment is protected. Trying with bypass...')
