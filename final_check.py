import urllib.request

# Fetch the raw GitHub version to verify it's correct
url = 'https://raw.githubusercontent.com/pixuan1989/dao-essence-shop/feature/wallpaper-dev/wallpaper-detail.html'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
resp = urllib.request.urlopen(req, timeout=15)
html = resp.read().decode('utf-8')

lines = html.split('\n')

# Check the critical section: L862-L864
print('=== Critical section check (L860-L870) ===')
for i in range(859, 870):
    print(f'L{i+1}: {lines[i].rstrip()}')

# Also check if there's a '}' at L864
print('\n=== Checking for extra brace ===')
if '}' in lines[863].strip() and '});' not in lines[863]:
    print('WARNING: Found extra } at L864!')
else:
    print('L864 looks OK')

# Check the exact content of L863 and L864
print(f'\nL863 raw: {repr(lines[862])}')
print(f'L864 raw: {repr(lines[863])}')
