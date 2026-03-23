#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import re
import sys

print('[FIX] Starting Creem API discount fix...')

# Fix 1: api/products.js
try:
    with open('api/products.js', 'r', encoding='utf-8') as f:
        api_content = f.read()
    
    # Add discount and discountRate fields after originalPrice
    old_api = '''    originalPrice: parseFloat(creemProduct.original_price || creemProduct.price),
    currency: creemProduct.currency || 'USD','''
    
    new_api = '''    originalPrice: parseFloat(creemProduct.original_price || creemProduct.price),
    discount: Math.max(0, (parseFloat(creemProduct.original_price || creemProduct.price) || 0) - (parseFloat(creemProduct.price) || 0)),
    discountRate: (function() {
      const orig = parseFloat(creemProduct.original_price || creemProduct.price) || 0;
      const curr = parseFloat(creemProduct.price) || 0;
      return (orig > 0 && orig > curr) ? Math.round(((orig - curr) / orig) * 100) : 0;
    })(),
    currency: creemProduct.currency || 'USD','''
    
    if old_api in api_content:
        api_content = api_content.replace(old_api, new_api)
        with open('api/products.js', 'w', encoding='utf-8') as f:
            f.write(api_content)
        print('[OK] api/products.js fixed')
    else:
        print('[WARN] api/products.js pattern not found')
except Exception as e:
    print(f'[ERROR] api/products.js: {e}')

# Fix 2: js/creem-sync-v2.js
try:
    with open('js/creem-sync-v2.js', 'r', encoding='utf-8') as f:
        sync_content = f.read()
    
    # Add discount and discountRate to transformProducts
    old_sync = '''      originalPrice: parseFloat(product.originalPrice || product.original_price || product.price) || 0,
      currency: product.currency || 'USD','''
    
    new_sync = '''      originalPrice: parseFloat(product.originalPrice || product.original_price || product.price) || 0,
      discount: Math.max(0, (parseFloat(product.originalPrice || product.original_price || product.price) || 0) - (parseFloat(product.price) || 0)),
      discountRate: (function() {
        const orig = parseFloat(product.originalPrice || product.original_price || product.price) || 0;
        const curr = parseFloat(product.price) || 0;
        return (orig > 0 && orig > curr) ? Math.round(((orig - curr) / orig) * 100) : 0;
      })(),
      currency: product.currency || 'USD','''
    
    if old_sync in sync_content:
        sync_content = sync_content.replace(old_sync, new_sync)
        with open('js/creem-sync-v2.js', 'w', encoding='utf-8') as f:
            f.write(sync_content)
        print('[OK] js/creem-sync-v2.js fixed')
    else:
        print('[WARN] js/creem-sync-v2.js pattern not found')
except Exception as e:
    print(f'[ERROR] js/creem-sync-v2.js: {e}')

print('[DONE] Fix complete')
