import urllib.request
import json

# Try to access Vercel API to check deployment status
# First, let's check if we can get the deployment info
api_url = 'https://api.vercel.com/v13/deployments?url=daoessence-shop-lqeai7v6m-daodao-74dfe427.vercel.app'

try:
    req = urllib.request.Request(api_url, headers={
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json'
    })
    resp = urllib.request.urlopen(req, timeout=15)
    data = json.loads(resp.read().decode('utf-8'))
    print(json.dumps(data, indent=2))
except Exception as e:
    print(f'API error: {e}')
    
    # Try fetching the deployment directly
    url = 'https://daoessence-shop-lqeai7v6m-daodao-74dfe427.vercel.app/wallpaper-detail.html?id=wallpaper_1780233504'
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        resp = urllib.request.urlopen(req, timeout=15)
        html = resp.read().decode('utf-8')
        
        with open(r'C:\Users\agenew\Desktop\DaoEssence1.0\vercel_direct.html', 'w', encoding='utf-8') as f:
            f.write(html)
        print(f'Direct fetch success! Length: {len(html)}')
        
        # Check key markers
        for marker in ['wp-data', 'DOMContentLoaded', 'onerror', 'renderRelated']:
            print(f'{marker}: {"YES" if marker in html else "NO"}')
            
    except Exception as e2:
        print(f'Direct fetch also failed: {e2}')
