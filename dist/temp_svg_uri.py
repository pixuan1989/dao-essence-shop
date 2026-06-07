import urllib.parse

svgs = [
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="11" stroke="white" stroke-width="1.5"/><path d="M12 1a11 11 0 0 1 0 22 5.5 5.5 0 0 0 0-11 5.5 5.5 0 0 1 0-11z" fill="white"/><circle cx="12" cy="6.5" r="1.8" fill="#4527a0"/><circle cx="12" cy="17.5" r="1.8" fill="white"/></svg>',
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a5d6a7" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M19 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/></svg>',
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f48fb1" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>'
]

for i, svg in enumerate(svgs, 1):
    print(f'--- SVG {i} ---')
    print(f'data:image/svg+xml,{urllib.parse.quote(svg)}')
    print()
