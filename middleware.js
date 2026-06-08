// Vercel Edge Middleware - handle -2026-06-07 date-suffixed wallpaper URLs
// Single 301 redirect directly to FINAL destination - ZERO redirect chain.
// Auto-generated: do not edit manually.

import { NextResponse } from 'next/server';

const DATE_SUFFIX = '-2026-06-07';

// In-memory cache (warm on first request)
let _wpCache = null;
let _redirectMap = null;
let _cacheExpiry = 0;
const CACHE_TTL = 60000; // 60s

async function loadCache(request) {
  const now = Date.now();
  if (_wpCache && now < _cacheExpiry) return;
  try {
    // Fetch wallpapers.json
    const wpRes = await fetch(new URL('/wallpapers.json', request.url), { signal: AbortSignal.timeout(3000) });
    if (wpRes.ok) _wpCache = await wpRes.json();
    // Fetch vercel.json (redirect rules)
    const vcRes = await fetch(new URL('/vercel.json', request.url), { signal: AbortSignal.timeout(3000) });
    if (vcRes.ok) {
      const v = await vcRes.json();
      // Build redirect map: source -> destination (follow chains once)
      const raw = {};
      (v.redirects || []).forEach(r => { raw[r.source] = r.destination; });
      // Pre-compute final destinations (follow chains)
      const final = {};
      const getFinal = (src) => {
        let cur = src;
        const visited = new Set();
        for (let i = 0; i < 10; i++) {
          if (visited.has(cur)) return src; // circular, fallback
          visited.add(cur);
          const next = raw[cur] || (cur.endsWith('/') ? raw[cur.slice(0, -1)] : raw[cur + '/']);
          if (!next) break;
          cur = next;
        }
        return cur;
      };
      for (const [src, dst] of Object.entries(raw)) {
        final[src] = getFinal(dst);
      }
      _redirectMap = { raw, final };
    }
    _cacheExpiry = now + CACHE_TTL;
  } catch (e) {
    // keep stale cache or leave null
  }
}

async function middleware(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  if (!pathname.includes(DATE_SUFFIX)) {
    return NextResponse.next();
  }

  // Ensure cache is loaded
  await loadCache(request);

  // Parse the incoming URL
  const isZh = pathname.startsWith('/zh/wallpaper/');
  const prefix = isZh ? '/zh/wallpaper/' : '/wallpaper/';
  const idx = pathname.indexOf(DATE_SUFFIX);
  if (idx === -1) return NextResponse.next();

  const baseSlug = pathname.substring(prefix.length, idx); // slug without date suffix
  const hasTrailing = pathname.endsWith('/');
  const search = url.search;

  // Try to find the correct wallpaper
  let correctSlug = null;
  if (_wpCache) {
    for (const w of _wpCache) {
      if (!w.slug) continue;
      if (w.slug === baseSlug) { correctSlug = w.slug; break; }
      if (w.id && ('wallpaper_' + baseSlug === w.id || baseSlug === w.id.replace('wallpaper_', ''))) {
        correctSlug = w.slug; break;
      }
    }
  }
  if (!correctSlug) correctSlug = baseSlug; // fallback: use base as-is

  // Compute the FIRST redirect target (what /wallpaper/{correctSlug} would redirect to, if anything)
  const firstTarget = prefix + correctSlug + (hasTrailing ? '/' : '');
  let finalDest = firstTarget;

  if (_redirectMap) {
    // Check raw map first (exact source match)
    if (_redirectMap.final[firstTarget]) {
      finalDest = _redirectMap.final[firstTarget];
    } else if (_redirectMap.final[firstTarget.replace(/\/$/, '')]) {
      finalDest = _redirectMap.final[firstTarget.replace(/\/$/, '')];
    }
  }

  // Single 301 to FINAL destination - ZERO chain
  return NextResponse.redirect(new URL(finalDest + search, url.origin), 301);
}

export const config = {
  matcher: ['/wallpaper/:path*', '/zh/wallpaper/:path*'],
};

export { middleware };
