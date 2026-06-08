export default function middleware(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  if (pathname.includes('-2026-06-07')) {
    const clean = pathname.replace('-2026-06-07', '');
    return Response.redirect(new URL(clean + url.search, url.origin), 301);
  }
}
