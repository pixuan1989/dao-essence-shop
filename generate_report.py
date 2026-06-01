import urllib.request

url = 'https://raw.githubusercontent.com/pixuan1989/dao-essence-shop/feature/wallpaper-dev/wallpaper-detail.html'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
resp = urllib.request.urlopen(req, timeout=15)
html = resp.read().decode('utf-8')

lines = html.split('\n')

with open(r'C:\Users\agenew\Desktop\DaoEssence1.0\vercel_check_report.txt', 'w', encoding='utf-8') as f:
    f.write('=== VERCEL DEPLOYMENT CHECK REPORT ===\n')
    f.write('GitHub Version Analysis\n\n')
    
    # 1. Check wp-data
    f.write('1. wp-data embedded: ' + ('YES' if 'wp-data' in html else 'NO') + '\n')
    
    # 2. Check DOMContentLoaded
    f.write('2. DOMContentLoaded listener: ' + ('YES' if 'DOMContentLoaded' in html else 'NO') + '\n')
    
    # 3. Check onerror
    f.write('3. img.onerror handler: ' + ('YES' if 'onerror' in html else 'NO') + '\n')
    
    # 4. Check try-catch structure
    f.write('4. try-catch structure: ')
    if '} catch(e) {' in html and 'renderRelated(index);' in html:
        idx1 = html.index('renderRelated(index);')
        idx2 = html.index('} catch(e) {')
        if idx2 > idx1:
            f.write('CORRECT (catch follows try)\n')
        else:
            f.write('WRONG (catch before try?)\n')
    else:
        f.write('NOT FOUND\n')
    
    # 5. Check for extra brace at L864
    f.write('5. Extra brace at L864: ')
    if lines[863].strip() == '}':
        f.write('YES (ERROR!)\n')
    else:
        f.write('NO (OK)\n')
    
    # 6. Check toggle listener closure
    f.write('6. Toggle listener closure (L863): ' + lines[862].strip() + '\n')
    
    # 7. Check init call
    f.write('7. init() call: ')
    if "document.addEventListener('DOMContentLoaded', init);" in html:
        f.write('CORRECT (wrapped in DOMContentLoaded)\n')
    elif "init();" in html:
        f.write('DIRECT CALL (no DOMContentLoaded)\n')
    else:
        f.write('NOT FOUND\n')
    
    # 8. Overall assessment
    f.write('\n=== OVERALL ASSESSMENT ===\n')
    checks = [
        'wp-data' in html,
        'DOMContentLoaded' in html,
        'onerror' in html,
        '} catch(e) {' in html,
        lines[863].strip() != '}',
        "document.addEventListener('DOMContentLoaded', init);" in html
    ]
    passed = sum(checks)
    total = len(checks)
    f.write(f'Passed: {passed}/{total}\n')
    if passed == total:
        f.write('RESULT: ALL CHECKS PASSED - GitHub code is correct\n')
    else:
        f.write('RESULT: SOME CHECKS FAILED - GitHub code has issues\n')
    
    # 9. Vercel deployment note
    f.write('\n=== VERCEL DEPLOYMENT NOTE ===\n')
    f.write('Vercel preview deployments are protected (401 Unauthorized).\n')
    f.write('Cannot directly verify deployed code.\n')
    f.write('Please check Vercel Dashboard for:\n')
    f.write('1. Build status (should be "Ready")\n')
    f.write('2. Build logs (no errors)\n')
    f.write('3. Deployment commit hash (should match GitHub latest commit)\n')
    f.write('4. Try hard refresh (Ctrl+Shift+R) to bypass browser cache\n')

print('Report saved to vercel_check_report.txt')
