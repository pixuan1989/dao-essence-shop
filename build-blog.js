/**
 * build-blog.js
 * Vercel build script: converts CMS .md files to .html and updates article listings.
 * 
 * Build flow:
 *   1. Copy project files to dist/ (excluding .git, node_modules, .md sources)
 *   2. Read .md files from blog/posts/ and blog/<category>/
 *   3. Generate article HTML → dist/blog/*.html
 *   4. Generate category pages → dist/blog/*.html
 *   5. Generate blog index → dist/blog/index.html
 *   6. Vercel deploys from dist/ (outputDirectory)
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';
import { marked } from 'marked';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC_DIR = __dirname;
const DIST_DIR = path.join(__dirname, 'dist');
const BLOG_DIR = path.join(SRC_DIR, 'blog');
const POSTS_DIR = path.join(BLOG_DIR, 'posts');
const DIST_BLOG_DIR = path.join(DIST_DIR, 'blog');

// Category subfolder collections from CMS config
const CATEGORY_FOLDERS = [
  'bazi-astrology',
  'zodiac-horoscope',
  'feng-shui',
  'daily-horoscope',
  'lucky-tips'
];

// Category display names
const CATEGORY_LABELS = {
  'bazi-astrology': 'BaZi Astrology',
  'zodiac-horoscope': 'Chinese Zodiac',
  'feng-shui': 'Feng Shui',
  'daily-horoscope': 'Daily Chinese Horoscope',
  'lucky-tips': 'Lucky Tips'
};

// CSS version for cache busting
const CSS_VERSION = Date.now();
const SITE_URL = 'https://www.daoessentia.com';

// Shared nav HTML
const NAV_HTML = `
    <header class="header scrolled">
        <div class="container">
            <nav class="nav">
                <a href="/" class="logo">
                    <div class="logo-icon"></div>
                    <div class="logo-text"><span class="logo-en">DAO ESSENCE</span></div>
                </a>
                <ul class="nav-menu">
                    <li><a href="/" class="nav-link">Home</a></li>
                    <li class="nav-dropdown">
                        <a href="/blog/" class="nav-dropdown-trigger">Blog <i class="nav-dropdown-arrow"></i></a>
                        <div class="nav-dropdown-menu">
                            <a href="/blog/">All Articles</a>
                            <a href="/blog/bazi-astrology">BaZi Astrology</a>
                            <a href="/blog/zodiac-horoscope">Chinese Zodiac</a>
                            <a href="/blog/feng-shui">Feng Shui</a>
                            <a href="/blog/daily-horoscope">Daily Horoscope</a>
                            <a href="/blog/lucky-tips">Lucky Tips</a>
                        </div>
                    </li>
                    <li><a href="/culture" class="nav-link">Five Elements</a></li>
                    <li><a href="/shop" class="nav-link">Shop</a></li>
                    <li><a href="/about" class="nav-link">About Us</a></li>
                </ul>
                <button class="mobile-menu-btn"><span></span><span></span><span></span></button>
            </nav>
        </div>
    </header>`;

const FOOTER_HTML = `
    <footer class="footer">
        <div class="container">
            <div class="footer-content">
                <div class="footer-brand">
                    <div class="footer-logo">
                        <div class="logo-icon"></div>
                        <span class="logo-en">DAO ESSENCE</span>
                    </div>
                    <p class="footer-desc">Practical Chinese metaphysics for modern life. Free BaZi analysis, Feng Shui guidance, and Five Elements wisdom — no mystification, no fortune-cookie readings.</p>
                </div>
                <div class="footer-links">
                    <h4>Explore</h4>
                    <a href="/blog/">Blog</a>
                    <a href="/culture">Five Elements</a>
                    <a href="/shop">Shop</a>
                </div>
                <div class="footer-links">
                    <h4>Blog Categories</h4>
                    <a href="/blog/bazi-astrology">BaZi Astrology</a>
                    <a href="/blog/zodiac-horoscope">Chinese Zodiac</a>
                    <a href="/blog/feng-shui">Feng Shui</a>
                    <a href="/blog/daily-horoscope">Daily Horoscope</a>
                    <a href="/blog/lucky-tips">Lucky Tips</a>
                </div>
                <div class="footer-links">
                    <h4>Support</h4>
                    <a href="/about">About Us</a>
                    <a href="/privacy">Privacy Policy</a>
                    <a href="/terms">Terms of Service</a>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2024-2026 DAO Essence. All rights reserved.</p>
                <div class="footer-social">
                    <a href="https://www.instagram.com/daoessence" target="_blank" rel="noopener" aria-label="Instagram">Instagram</a>
                    <a href="https://www.pinterest.com/daoessence" target="_blank" rel="noopener" aria-label="Pinterest">Pinterest</a>
                    <a href="https://www.reddit.com/r/daoessence" target="_blank" rel="noopener" aria-label="Reddit">Reddit</a>
                </div>
            </div>
        </div>
    </footer>`;

const ARTICLE_STYLES = `
        body { background-color: #FFFFFF !important; }

        /* ── Two-column layout: content + sidebar ── */
        .blog-layout {
            display: flex;
            max-width: 1200px;
            margin: 0 auto;
            padding: 7rem 2rem;
            gap: 2.5rem;
            align-items: flex-start;
        }
        .blog-content {
            flex: 1;
            min-width: 0;
        }
        .blog-sidebar {
            width: 320px;
            flex-shrink: 0;
            position: sticky;
            top: 100px;
        }

        /* ── Article typography ── */
        .blog-article { }
        .blog-article h1 { font-family: var(--font-display); font-size: clamp(1.8rem, 4vw, 2.6rem); color: #1A1A1A; margin-bottom: 0.5rem; letter-spacing: 0.08em; line-height: 1.2; }
        .blog-meta { color: var(--text-secondary); font-size: 0.88rem; margin-bottom: 2.5rem; padding-bottom: 2rem; border-bottom: 1px solid rgba(212,175,55,0.15); }
        .blog-article h2 { font-family: var(--font-display); font-size: 1.5rem; color: #1A1A1A; margin: 2.5rem 0 1rem; letter-spacing: 0.05em; }
        .blog-article h3 { font-family: var(--font-display); font-size: 1.15rem; color: #1A1A1A; margin: 2rem 0 0.8rem; }
        .blog-article p { color: var(--text-secondary); line-height: 1.9; font-size: 1rem; margin-bottom: 1.2rem; }
        .blog-article strong { color: var(--text-primary); }
        .blog-article ul, .blog-article ol { color: var(--text-secondary); line-height: 2; margin-bottom: 1.2rem; padding-left: 1.5rem; }
        .blog-article li { margin-bottom: 0.5rem; }
        .blog-article blockquote { border-left: 4px solid var(--accent-color); padding: 1rem 1.5rem; margin: 2rem 0; background: rgba(212,175,55,0.04); border-radius: 0 8px 8px 0; }
        .blog-article blockquote p { margin-bottom: 0; font-style: italic; }
        .blog-article table { width: 100%; border-collapse: collapse; margin: 2rem 0; }
        .blog-article th, .blog-article td { border: 1px solid rgba(212,175,55,0.15); padding: 0.8rem 1rem; text-align: left; }
        .blog-article th { background: rgba(212,175,55,0.06); color: var(--accent-color); font-family: var(--font-display); font-size: 0.9rem; letter-spacing: 0.03em; }
        .blog-article td { color: var(--text-secondary); font-size: 0.95rem; }
        .blog-article img { max-width: 100%; border-radius: 8px; margin: 1.5rem 0; }
        .blog-article a { color: var(--accent-color); text-decoration: underline; }
        .blog-article a:hover { color: #E8C547; }

        /* ── Related Posts (You May Also Like) ── */
        .related-posts { margin-top: 3rem; padding-top: 2rem; border-top: 1px solid rgba(212,175,55,0.15); }
        .related-posts-title { font-family: var(--font-display); font-size: 1.3rem; color: var(--accent-color); letter-spacing: 0.06em; margin-bottom: 1.5rem; }
        .related-posts-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.2rem; }
        .related-card { display: flex; flex-direction: column; text-decoration: none; border-radius: 10px; overflow: hidden; background: rgba(212,175,55,0.03); border: 1px solid rgba(212,175,55,0.1); transition: all 0.3s ease; }
        .related-card:hover { background: rgba(212,175,55,0.06); border-color: rgba(212,175,55,0.25); transform: translateY(-2px); box-shadow: 0 6px 24px rgba(0,0,0,0.1); }
        .related-card-img { aspect-ratio: 16/9; overflow: hidden; background: var(--bg-dark); }
        .related-card-img img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.4s; }
        .related-card:hover .related-card-img img { transform: scale(1.05); }
        .related-card-body { padding: 1rem; display: flex; flex-direction: column; gap: 0.3rem; }
        .related-card-cat { font-size: 0.7rem; color: var(--accent-color); letter-spacing: 0.12em; text-transform: uppercase; opacity: 0.8; }
        .related-card h3 { font-size: 0.92rem; color: #1A1612; line-height: 1.4; letter-spacing: 0.02em; transition: color 0.3s; }
        .related-card:hover h3 { color: #1A1612; }
        @media (max-width: 900px) { .related-posts-grid { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 540px) { .related-posts-grid { grid-template-columns: 1fr; } }

        /* ── Sidebar CTA: shared ── */
        .sidebar-cta {
            border-radius: 16px;
            padding: 2rem 1.5rem;
            text-align: left;
            position: relative;
            overflow: hidden;
            margin-bottom: 1.5rem;
        }
        .sidebar-cta h3 {
            font-family: var(--font-display);
            font-size: 1.15rem;
            letter-spacing: 0.06em;
            margin-bottom: 0.5rem;
            position: relative;
            line-height: 1.3;
        }
        .sidebar-cta .cta-sub {
            font-size: 0.85rem;
            line-height: 1.5;
            margin-bottom: 1.2rem;
            position: relative;
        }
        .sidebar-cta .cta-features {
            display: flex;
            flex-direction: column;
            gap: 0.6rem;
            margin-bottom: 1.5rem;
            position: relative;
        }
        .sidebar-cta .cta-feat {
            font-size: 0.82rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        .sidebar-cta .cta-feat-icon {
            width: 18px; height: 18px;
            border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            flex-shrink: 0;
        }
        .sidebar-cta .cta-btn {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.75rem 1.6rem;
            text-decoration: none;
            font-weight: 600;
            font-size: 0.9rem;
            letter-spacing: 0.04em;
            border-radius: 60px;
            transition: all 0.3s ease;
            position: relative;
        }
        .sidebar-cta .cta-btn::after { content: '\\2192'; font-size: 1rem; transition: transform 0.3s; }
        .sidebar-cta .cta-btn:hover::after { transform: translateX(4px); }

        /* ── Sidebar CTA: BaZi (gold theme) ── */
        .sidebar-cta--bazi {
            background: linear-gradient(160deg, #1A1208 0%, #2C2416 60%, #3D3422 100%);
            border: 1px solid rgba(212,175,55,0.25);
            box-shadow: 0 8px 32px rgba(0,0,0,0.12);
        }
        .sidebar-cta--bazi::after {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0;
            height: 2px;
            background: linear-gradient(90deg, transparent, rgba(212,175,55,0.5), transparent);
        }
        .sidebar-cta--bazi h3 { color: #D4AF37; }
        .sidebar-cta--bazi .cta-sub { color: rgba(255,255,255,0.65); }
        .sidebar-cta--bazi .cta-feat { color: rgba(255,255,255,0.55); }
        .sidebar-cta--bazi .cta-feat-icon { background: rgba(212,175,55,0.15); border: 1px solid rgba(212,175,55,0.25); }
        .sidebar-cta--bazi .cta-feat-icon svg { color: #D4AF37; }
        .sidebar-cta--bazi .cta-btn {
            background: linear-gradient(135deg, #D4AF37, #E8C547);
            color: #1A1208;
            box-shadow: 0 4px 16px rgba(212,175,55,0.3);
        }
        .sidebar-cta--bazi .cta-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 24px rgba(212,175,55,0.45); }

        /* ── Sidebar CTA: Soulmate (rose / love theme) ── */
        .sidebar-cta--soulmate {
            background: linear-gradient(160deg, #1A1018 0%, #2C1A24 60%, #3D2230 100%);
            border: 1px solid rgba(196,125,125,0.25);
            box-shadow: 0 8px 32px rgba(0,0,0,0.12);
        }
        .sidebar-cta--soulmate::after {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0;
            height: 2px;
            background: linear-gradient(90deg, transparent, rgba(196,125,125,0.5), transparent);
        }
        .sidebar-cta--soulmate::before {
            content: '';
            position: absolute;
            inset: 0;
            background: radial-gradient(ellipse at 50% 0%, rgba(196,125,125,0.08) 0%, transparent 60%);
            pointer-events: none;
        }
        .sidebar-cta--soulmate h3 { color: #D49090; }
        .sidebar-cta--soulmate .cta-sub { color: rgba(255,255,255,0.6); }
        .sidebar-cta--soulmate .cta-feat { color: rgba(255,255,255,0.5); }
        .sidebar-cta--soulmate .cta-feat-icon { background: rgba(196,125,125,0.15); border: 1px solid rgba(196,125,125,0.25); }
        .sidebar-cta--soulmate .cta-feat-icon svg { color: #C47D7D; }
        .sidebar-cta--soulmate .cta-btn {
            background: linear-gradient(135deg, #C47D7D, #A85D5D);
            color: #fff;
            box-shadow: 0 4px 16px rgba(196,125,125,0.3);
        }
        .sidebar-cta--soulmate .cta-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 24px rgba(196,125,125,0.45); background: linear-gradient(135deg, #D49090, #C47D7D); }

        /* ── Sidebar CTA: Five Elements (teal / nature theme) ── */
        .sidebar-cta--five-elements {
            background: linear-gradient(160deg, #081A18 0%, #142C24 60%, #1E3D32 100%);
            border: 1px solid rgba(76,145,130,0.25);
            box-shadow: 0 8px 32px rgba(0,0,0,0.12);
        }
        .sidebar-cta--five-elements::after {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0;
            height: 2px;
            background: linear-gradient(90deg, transparent, rgba(76,145,130,0.5), transparent);
        }
        .sidebar-cta--five-elements h3 { color: #6BC4B0; }
        .sidebar-cta--five-elements .cta-sub { color: rgba(255,255,255,0.6); }
        .sidebar-cta--five-elements .cta-feat { color: rgba(255,255,255,0.5); }
        .sidebar-cta--five-elements .cta-feat-icon { background: rgba(76,145,130,0.15); border: 1px solid rgba(76,145,130,0.25); }
        .sidebar-cta--five-elements .cta-feat-icon svg { color: #4C9182; }
        .sidebar-cta--five-elements .cta-btn {
            background: linear-gradient(135deg, #4C9182, #3A7A6C);
            color: #fff;
            box-shadow: 0 4px 16px rgba(76,145,130,0.3);
        }
        .sidebar-cta--five-elements .cta-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 24px rgba(76,145,130,0.45); background: linear-gradient(135deg, #6BC4B0, #4C9182); }

        /* ── Sidebar CTA: Almanac (warm gold / calendar theme) ── */
        .sidebar-cta--almanac {
            background: linear-gradient(160deg, #14100A 0%, #261E12 60%, #382C1C 100%);
            border: 1px solid rgba(212,175,55,0.25);
            box-shadow: 0 8px 32px rgba(0,0,0,0.12);
        }
        .sidebar-cta--almanac::after {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0;
            height: 2px;
            background: linear-gradient(90deg, transparent, rgba(212,175,55,0.5), transparent);
        }
        .sidebar-cta--almanac h3 { color: #D4AF37; }
        .sidebar-cta--almanac .cta-sub { color: rgba(255,255,255,0.65); }
        .sidebar-cta--almanac .cta-feat { color: rgba(255,255,255,0.55); }
        .sidebar-cta--almanac .cta-feat-icon { background: rgba(212,175,55,0.15); border: 1px solid rgba(212,175,55,0.25); }
        .sidebar-cta--almanac .cta-feat-icon svg { color: #D4AF37; }
        .sidebar-cta--almanac .cta-btn {
            background: linear-gradient(135deg, #D4AF37, #E8C547);
            color: #1A1208;
            box-shadow: 0 4px 16px rgba(212,175,55,0.3);
        }
        .sidebar-cta--almanac .cta-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 24px rgba(212,175,55,0.45); }

        /* ── Mobile: stack layout ── */
        @media (max-width: 900px) {
            .blog-layout {
                flex-direction: column;
                padding: 6rem 1.5rem;
            }
            .blog-sidebar {
                width: 100%;
                position: relative;
                top: auto;
            }
        }`;

// ─── Zodiac Lookup Widget ──────────────────────────────────
const ZODIAC_LOOKUP_HTML = `
<div class="zodiac-lookup-widget" id="zodiacLookup">
    <style>
        .zodiac-lookup-widget {
            background: linear-gradient(135deg, rgba(212,175,55,0.08), rgba(212,175,55,0.03));
            border: 1px solid rgba(212,175,55,0.2);
            border-radius: 16px;
            padding: 2.5rem 2rem;
            margin: 3rem 0;
            text-align: center;
        }
        .zodiac-lookup-widget h3 {
            font-family: var(--font-display);
            color: var(--accent-color);
            font-size: 1.4rem;
            letter-spacing: 0.08em;
            margin-bottom: 0.5rem;
        }
        .zodiac-lookup-widget p.sub {
            color: var(--text-secondary);
            font-size: 0.92rem;
            margin-bottom: 1.8rem;
        }
        .zodiac-form {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.8rem;
            flex-wrap: wrap;
        }
        .zodiac-form select, .zodiac-form input {
            padding: 0.7rem 1.2rem;
            border: 1px solid rgba(212,175,55,0.3);
            border-radius: 8px;
            background: rgba(255,255,255,0.8);
            color: var(--text-primary);
            font-size: 1rem;
            font-family: inherit;
            outline: none;
            transition: border-color 0.3s;
        }
        .zodiac-form select:focus, .zodiac-form input:focus {
            border-color: var(--accent-color);
        }
        .zodiac-form button {
            padding: 0.7rem 1.8rem;
            background: var(--accent-color);
            color: #1A1208;
            border: none;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            letter-spacing: 0.03em;
            transition: all 0.3s;
        }
        .zodiac-form button:hover {
            background: #E8C547;
            transform: translateY(-1px);
            box-shadow: 0 4px 16px rgba(212,175,55,0.3);
        }
        .zodiac-result {
            margin-top: 2rem;
            display: none;
        }
        .zodiac-result.show {
            display: block;
            animation: zodiacFadeIn 0.5s ease;
        }
        @keyframes zodiacFadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .zodiac-result .zodiac-emoji {
            font-size: 3.5rem;
            line-height: 1;
            margin-bottom: 0.5rem;
        }
        .zodiac-result .zodiac-name {
            font-family: var(--font-display);
            font-size: 1.8rem;
            color: var(--accent-color);
            letter-spacing: 0.1em;
            margin-bottom: 0.3rem;
        }
        .zodiac-result .zodiac-desc {
            color: var(--text-secondary);
            font-size: 0.95rem;
            line-height: 1.6;
        }
    </style>
    <h3>🐍 What's Your Chinese Zodiac?</h3>
    <p class="sub">Enter your birth year to find out</p>
    <div class="zodiac-form">
        <select id="zodiacYear">
            <option value="">Select Year</option>
        </select>
        <select id="zodiacMonth">
            <option value="">Month</option>
            <option value="1">January</option>
            <option value="2">February</option>
            <option value="3">March</option>
            <option value="4">April</option>
            <option value="5">May</option>
            <option value="6">June</option>
            <option value="7">July</option>
            <option value="8">August</option>
            <option value="9">September</option>
            <option value="10">October</option>
            <option value="11">November</option>
            <option value="12">December</option>
        </select>
        <button onclick="lookupZodiac()">Look Up</button>
    </div>
    <div class="zodiac-result" id="zodiacResult">
        <div class="zodiac-emoji" id="zodiacEmoji"></div>
        <div class="zodiac-name" id="zodiacName"></div>
        <div class="zodiac-desc" id="zodiacDesc"></div>
    </div>
    <script>
    (function() {
        // Populate year dropdown (1940-2026)
        var sel = document.getElementById('zodiacYear');
        if (sel) {
            for (var y = 2026; y >= 1940; y--) {
                var opt = document.createElement('option');
                opt.value = y;
                opt.textContent = y;
                sel.appendChild(opt);
            }
        }
    })();

    var ZODIAC_DATA = {
        'Rat': { emoji: '🐭', desc: 'Quick-witted, resourceful, and versatile. Rats are natural problem-solvers with sharp intuition.' },
        'Ox': { emoji: '🐂', desc: 'Diligent, dependable, and determined. The Ox embodies strength, patience, and honest hard work.' },
        'Tiger': { emoji: '🐅', desc: 'Brave, competitive, and confident. Tigers are born leaders who embrace challenges with courage.' },
        'Rabbit': { emoji: '🐇', desc: 'Gentle, elegant, and alert. Rabbits have a refined nature and a talent for diplomacy.' },
        'Dragon': { emoji: '🐉', desc: 'Energetic, fearless, and charismatic. Dragons are the most revered sign, full of vitality and ambition.' },
        'Snake': { emoji: '🐍', desc: 'Wise, enigmatic, and intuitive. Snakes possess deep insight and a calm, strategic mind.' },
        'Horse': { emoji: '🐎', desc: 'Animated, active, and energetic. Horses love freedom and have an adventurous, warm-hearted spirit.' },
        'Goat': { emoji: '🐑', desc: 'Calm, gentle, and sympathetic. Goats are creative souls with a deep appreciation for beauty and harmony.' },
        'Monkey': { emoji: '🐒', desc: 'Sharp, smart, and curious. Monkeys are clever innovators with a playful, magnetic personality.' },
        'Rooster': { emoji: '🐓', desc: 'Observant, hardworking, and courageous. Roosters are perfectionists with a strong sense of timing.' },
        'Dog': { emoji: '🐕', desc: 'Loyal, honest, and amiable. Dogs are steadfast companions who value justice and loyalty above all.' },
        'Pig': { emoji: '🐖', desc: 'Compassionate, generous, and diligent. Pigs have a kind heart and an easy-going, optimistic nature.' }
    };

    var ZODIAC_CN_EN = {
        '鼠': 'Rat', '牛': 'Ox', '虎': 'Tiger', '兔': 'Rabbit',
        '龙': 'Dragon', '蛇': 'Snake', '马': 'Horse', '羊': 'Goat',
        '猴': 'Monkey', '鸡': 'Rooster', '狗': 'Dog', '猪': 'Pig'
    };

    function lookupZodiac() {
        var year = parseInt(document.getElementById('zodiacYear').value);
        var month = parseInt(document.getElementById('zodiacMonth').value);
        if (!year || !month) {
            alert('Please select your birth year and month.');
            return;
        }
        if (typeof window.p === 'undefined') {
            alert('Zodiac engine is still loading. Please try again in a moment.');
            return;
        }
        // Use paipan engine: GetGZ(year, month, day, hour, min, sec)
        // We use mid-month (15th) at noon to avoid edge cases near lichun
        var result = p.GetGZ(year, month, 15, 12, 0, 10);
        if (!result) {
            alert('Could not calculate. Please check your input.');
            return;
        }
        var dzIndex = result[1][0]; // year branch index
        var sxCN = p.csx[dzIndex]; // Chinese zodiac animal name
        var sxEN = ZODIAC_CN_EN[sxCN] || sxCN;
        var data = ZODIAC_DATA[sxEN];
        if (!data) return;

        document.getElementById('zodiacEmoji').textContent = data.emoji;
        document.getElementById('zodiacName').textContent = 'You are the ' + sxEN;
        document.getElementById('zodiacDesc').textContent = data.desc;
        var el = document.getElementById('zodiacResult');
        el.className = 'zodiac-result show';
    }
    <\/script>
</div>`;

// ─── Helpers ────────────────────────────────────────────────

function copyDirSync(src, dest, excludeDirs = []) {
  // Create destination if it doesn't exist
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (excludeDirs.includes(entry.name)) continue;

    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath, excludeDirs);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

const AUTHOR_INFO = {
  'Xuanzhen': {
    name: 'Master Xuanzhen',
    title: 'Senior BaZi & Feng Shui Master at DaoEssence',
    bio: 'Specializing in Chinese metaphysics, BaZi chart analysis, and Feng Shui consultation with over 15 years of experience.'
  },
  'Dingwei': {
    name: 'Master Dingwei',
    title: 'Chinese Astrology & Five Elements Expert at DaoEssence',
    bio: 'Focused on Chinese Zodiac forecasting, Five Elements (Wu Xing) theory, and daily horoscope analysis.'
  }
};

// Normalize author name: map old values to valid AUTHOR_INFO keys, default to Xuanzhen
function normalizeAuthor(author) {
  if (!author) return 'Xuanzhen';
  const a = String(author).trim();
  if (AUTHOR_INFO[a]) return a;
  const lower = a.toLowerCase();
  if (lower.includes('xuanzhen') || lower.includes('xuan')) return 'Xuanzhen';
  if (lower.includes('dingwei') || lower.includes('ding')) return 'Dingwei';
  return 'Xuanzhen';
}

function generateSlug(filename, data, existingSlugs) {
  // Remove .md extension and surrounding quotes
  let base = filename.replace(/\.md$/, '').replace(/^["'""'']+|["'""'']+$/g, '');
  
  // Replace CJK parens and special chars with dash
  base = base.replace(/[（()）\[\]【】]/g, '-');
  
  // Try ASCII slug first
  const asciiSlug = base.toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 80);
  
  if (/^[\w-]+$/.test(asciiSlug) && asciiSlug.length > 2) {
    let finalSlug = asciiSlug;
    let counter = 1;
    while (existingSlugs.has(finalSlug)) {
      finalSlug = `${asciiSlug}-${counter++}`;
    }
    existingSlugs.add(finalSlug);
    return finalSlug;
  }
  
  // For Chinese titles: use date + short hash
  const rawDate = data.date instanceof Date ? data.date.toISOString() : String(data.date || '');
  const dateStr = rawDate.replace(/[-\sT:Z]/g, '').substring(0, 8) || 'untitled';
  const hash = base.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0).toString(36).substring(0, 4);
  let finalSlug = `post-${dateStr}-${hash}`;
  let counter = 1;
  while (existingSlugs.has(finalSlug)) {
    finalSlug = `post-${dateStr}-${hash}-${counter++}`;
  }
  existingSlugs.add(finalSlug);
  return finalSlug;
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function readAllMdFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.md'))
    .map(f => {
      const raw = fs.readFileSync(path.join(dir, f), 'utf-8');
      const { data, content } = matter(raw);
      return { filename: f, slug: f.replace(/\.md$/, ''), data, content };
    });
}

// ─── Generate Article HTML ──────────────────────────────────

function generateArticleHtml(post, category, allArticles) {
  const { data, content, slug } = post;
  const dateFormatted = formatDate(data.date);
  const categoryLabel = CATEGORY_LABELS[category] || category;
  const categoryHref = `/blog/${category}`;

  // ── Related posts (You May Also Like) ──
  let relatedPosts = [];
  if (Array.isArray(data.related_posts) && data.related_posts.length > 0) {
    // Manual: match by title
    relatedPosts = data.related_posts
      .map(title => allArticles.find(p => p.data.title === title))
      .filter(Boolean)
      .filter(p => p.slug !== slug)
      .slice(0, 3);
  }
  if (relatedPosts.length === 0 && Array.isArray(allArticles)) {
    // Auto: same category, exclude current, pick up to 3 most recent
    relatedPosts = allArticles
      .filter(p => p.category === category && p.slug !== slug)
      .sort((a, b) => new Date(b.data.date || 0) - new Date(a.data.date || 0))
      .slice(0, 3);
  }




  function renderRelatedPosts() {
    if (relatedPosts.length === 0) return '';
    const cards = relatedPosts.map(p => {
      let imgSrc = p.data.image || SITE_URL + '/images/og-default.jpg';
      imgSrc = imgSrc.replace(/\/feature\/blog-cms\//g, '/main/');
      if (!imgSrc || imgSrc === '""') imgSrc = SITE_URL + '/images/og-default.jpg';
      const catLabel = CATEGORY_LABELS[p.category] || p.category || '';
      return `
              <a href="/blog/${p.slug}" class="related-card">
                <div class="related-card-img">
                  <img src="${imgSrc}" alt="${escapeHtml(p.data.title)}" loading="lazy" onerror="this.src='${SITE_URL}/images/og-default.jpg'">
                </div>
                <div class="related-card-body">
                  <span class="related-card-cat">${escapeHtml(catLabel)}</span>
                  <h3>${escapeHtml(p.data.title)}</h3>
                </div>
              </a>`;
    }).join('');
    return `
        <section class="related-posts">
          <h2 class="related-posts-title">You May Also Like</h2>
          <div class="related-posts-grid">${cards}
          </div>
        </section>`;
  }

  // CTA cards: read from frontmatter, fallback to bazi for old articles
  const ctaCards = Array.isArray(data.cta_cards) ? data.cta_cards : ['bazi'];

  function renderCtaCard(type) {
    switch (type) {
      case 'soulmate':
        return `
        <div class="sidebar-cta sidebar-cta--soulmate">
            <h3>Where Will You Meet Your Soulmate?</h3>
            <p class="cta-sub">Your birth date holds the map to your most fated love encounter. Discover your soulmate direction, love timing, and love style — free.</p>
            <div class="cta-features">
                <div class="cta-feat">
                    <span class="cta-feat-icon"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg></span>
                    Soulmate Direction
                </div>
                <div class="cta-feat">
                    <span class="cta-feat-icon"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg></span>
                    Love Timing
                </div>
                <div class="cta-feat">
                    <span class="cta-feat-icon"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg></span>
                    Love Style
                </div>
            </div>
            <a href="/soulmate-calculator" class="cta-btn">Find Your Soulmate</a>
        </div>`;
      case 'almanac':
        return `
        <div class="sidebar-cta sidebar-cta--almanac">
            <h3>Is Today a Good Day?</h3>
            <p class="cta-sub">Check the Chinese Almanac — 2,000 years of astrological wisdom distilled into a simple daily rating. Find your best day for any plan.</p>
            <div class="cta-features">
                <div class="cta-feat">
                    <span class="cta-feat-icon"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></span>
                    Daily 5-Star Rating
                </div>
                <div class="cta-feat">
                    <span class="cta-feat-icon"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l2 7h7l-5.5 4 2 7L12 16l-5.5 4 2-7L3 9h7z"/></svg></span>
                    Best Dates for Any Plan
                </div>
                <div class="cta-feat">
                    <span class="cta-feat-icon"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></span>
                    Do's and Don'ts
                </div>
            </div>
            <a href="/almanac.html" class="cta-btn">Check Today's Almanac</a>
        </div>`;
      case 'five-elements':
        return `
        <div class="sidebar-cta sidebar-cta--five-elements">
            <h3>What's Your Dominant Element?</h3>
            <p class="cta-sub">Wood, Fire, Earth, Metal, or Water — your birth date reveals which element governs your personality, health, and relationships.</p>
            <div class="cta-features">
                <div class="cta-feat">
                    <span class="cta-feat-icon"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 0 20"/></svg></span>
                    Element Profile
                </div>
                <div class="cta-feat">
                    <span class="cta-feat-icon"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l2 7h7l-5.5 4 2 7L12 16l-5.5 4 2-7L3 9h7z"/></svg></span>
                    Personality Traits
                </div>
                <div class="cta-feat">
                    <span class="cta-feat-icon"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg></span>
                    Health Guidance
                </div>
            </div>
            <a href="/five-elements-test" class="cta-btn">Discover Your Element</a>
        </div>`;
      case 'bazi':
      default:
        return `
        <div class="sidebar-cta sidebar-cta--bazi">
            <h3>Discover Your True Destiny</h3>
            <p class="cta-sub">Unlock the secrets hidden in your birth chart. Get a complete BaZi reading with Four Pillars of Destiny analysis.</p>
            <div class="cta-features">
                <div class="cta-feat">
                    <span class="cta-feat-icon"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg></span>
                    Four Pillars Reading
                </div>
                <div class="cta-feat">
                    <span class="cta-feat-icon"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l2 7h7l-5.5 4 2 7L12 16l-5.5 4 2-7L3 9h7z"/></svg></span>
                    Five Elements Analysis
                </div>
                <div class="cta-feat">
                    <span class="cta-feat-icon"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></span>
                    Life Path Insights
                </div>
            </div>
            <a href="/#free-bazi" class="cta-btn">Get Your Free BaZi Reading</a>
        </div>`;
    }
  }
  // Separate zodiac-lookup (inline widget) from sidebar CTA cards
  const hasZodiacCta = ctaCards.includes('zodiac-lookup');
  const sidebarCards = ctaCards.filter(t => t !== 'zodiac-lookup');
  const sidebarCtaHtml = sidebarCards.length > 0 ? sidebarCards.map(renderCtaCard).join('\n') : renderCtaCard('bazi');

  // Replace zodiac-lookup: either from Markdown marker or from cta_cards field
  const hasMarkdownMarker = content.includes('<!--zodiac-lookup-->');
  const hasZodiacLookup = hasMarkdownMarker || hasZodiacCta;
  const processedContent = hasMarkdownMarker
    ? content.replace('<!--zodiac-lookup-->', '<!--ZODIAC_LOOKUP_PLACEHOLDER-->')
    : content;
  const htmlBody = marked.parse(processedContent);
  // Fix: promote body <h1> to <h2> so only article title is the sole H1
  const fixedBody = htmlBody.replace(/<h1(.*?)>(.*?)<\/h1>/gi, '<h2$1>$2</h2>');
  let finalBody;
  if (hasMarkdownMarker) {
    // Replace inline placeholder
    finalBody = fixedBody.replace('<!--ZODIAC_LOOKUP_PLACEHOLDER-->', ZODIAC_LOOKUP_HTML);
  } else if (hasZodiacCta) {
    // Append widget at end of article content (will be placed before </article>)
    finalBody = fixedBody + '\n' + ZODIAC_LOOKUP_HTML;
  } else {
    finalBody = fixedBody;
  }

  // SEO helpers
  function seoTitle(title) {
    const suffix = ' | DAO Essence';
    const maxLen = 60;
    // escapeHtml first, then check length (to account for & -> &amp; etc.)
    const escaped = escapeHtml(title);
    const full = escaped + suffix;
    if (full.length <= maxLen) return full;
    const maxTitle = maxLen - suffix.length - 3; // 3 for '...'
    const truncated = escaped.substring(0, maxTitle).replace(/\s+\S*$/, '');
    return truncated + '...' + suffix;
  }
  function seoDescription(desc) {
    if (!desc) return '';
    if (desc.length <= 155) return desc;
    return desc.substring(0, 152).replace(/\s+\S*$/, '') + '...';
  }

  // FAQ structured data
  let faqJsonLd = '';
  if (data.faq && data.faq.length > 0) {
    const faqItems = data.faq.map(q => ({
      '@type': 'Question',
      'name': q.question,
      'acceptedAnswer': { '@type': 'Answer', 'text': q.answer }
    }));
    faqJsonLd = `
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": ${JSON.stringify(faqItems, null, 4)}
    }
    </script>`;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${seoTitle(data.title)}</title>
    <meta name="description" content="${escapeHtml(seoDescription(data.description || ''))}">
    <meta name="robots" content="index, follow">
    <meta property="og:title" content="${seoTitle(data.title)}">
    <meta property="og:description" content="${escapeHtml(seoDescription(data.description || ''))}">
    <meta property="og:image" content="${data.image || SITE_URL + '/images/og-default.jpg'}">
    <meta property="og:url" content="${SITE_URL}/blog/${slug}">
    <meta property="og:type" content="article">
    <meta property="og:site_name" content="DAO Essence">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${seoTitle(data.title)}">
    <meta name="twitter:description" content="${escapeHtml(seoDescription(data.description || ''))}">
    <meta name="twitter:image" content="${data.image || SITE_URL + '/images/og-default.jpg'}">
    <link rel="canonical" href="${SITE_URL}/blog/${slug}">
    <link rel="stylesheet" href="/styles.min.css?v=${CSS_VERSION}">
    <script src="/main.min.js?v=${CSS_VERSION}" defer></script>
    ${hasZodiacLookup ? '<script src="/bazi-calculator/paipan.js"><\/script>' : ''}
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Home", "item": "${SITE_URL}/"},
            {"@type": "ListItem", "position": 2, "name": "Blog", "item": "${SITE_URL}/blog/"},
            {"@type": "ListItem", "position": 3, "name": "${escapeHtml(data.title)}", "item": "${SITE_URL}/blog/${slug}"}
        ]
    }
    </script>
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "${escapeHtml(data.title)}",
        "description": "${escapeHtml(data.description || '')}",
        "image": "${data.image || SITE_URL + '/images/og-default.jpg'}",
        "author": {"@type": "Person", "name": "${escapeHtml(normalizeAuthor(data.author))}"},
        "publisher": {"@type": "Organization", "name": "DAO Essence", "logo": {"@type": "ImageObject", "url": "${SITE_URL}/images/og-default.jpg"}},
        "datePublished": "${data.date || ''}",
        "dateModified": "${data.date || ''}",
        "mainEntityOfPage": "${SITE_URL}/blog/${slug}"
    }
    </script>${faqJsonLd}
    <style>${ARTICLE_STYLES}</style>
</head>
<body>
${NAV_HTML}

    <div class="blog-layout">
        <div class="blog-content">
        <article class="blog-article">
            <p style="font-size: 0.8rem; color: var(--accent-color); letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 0.5rem;">${escapeHtml(categoryLabel)}</p>
            <h1>${escapeHtml(data.title)}</h1>
            ${data.image ? `<img src="${data.image}" alt="${escapeHtml(data.title)}" style="max-width:100%;border-radius:12px;margin:1.5rem 0;">` : ''}
            <div class="blog-meta">
                <span>By ${escapeHtml(normalizeAuthor(data.author))}</span>
                ${dateFormatted ? ` · <span>${dateFormatted}</span>` : ''}
                ${data.readTime ? ` · <span>${data.readTime} min read</span>` : ''}
            </div>

            ${finalBody}
        </article>

        ${renderRelatedPosts()}
        </div>

        <aside class="blog-sidebar">
        ${sidebarCtaHtml}
        </aside>
    </div>

${FOOTER_HTML}
</body>
</html>`;
}

// ─── Generate Category Page ─────────────────────────────────

function generateCategoryHtml(category, articles) {
  const label = CATEGORY_LABELS[category] || category;
  const cardHtml = articles.map(a => {
      let imgSrc = a.data.image || SITE_URL + '/images/og-default.jpg';
      imgSrc = imgSrc.replace(/\/feature\/blog-cms\//g, '/main/');
      if (!imgSrc || imgSrc === '""') imgSrc = SITE_URL + '/images/og-default.jpg';
      return `
            <a href="/blog/${a.slug}" class="blog-card">
                <div class="blog-card-image">
                    <img src="${imgSrc}" alt="${escapeHtml(a.data.title)}" loading="lazy" onerror="this.src='${SITE_URL}/images/og-default.jpg'">
                </div>
                <div class="blog-card-body">
                    <h2>${escapeHtml(a.data.title)}</h2>
                    <p>${escapeHtml(a.data.description || '')}</p>
                    <div class="blog-card-meta">
                        <span>${escapeHtml(normalizeAuthor(a.data.author))}</span>
                        ${a.data.readTime ? `<span>·</span><span>${a.data.readTime} min read</span>` : ''}
                    </div>
                </div>
            </a>`;
    }).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${label} Blog | DAO Essence</title>
    <meta name="description" content="Explore our ${label} articles — Chinese metaphysics, BaZi, Feng Shui, and more.">
    <meta name="robots" content="index, follow">
    <meta property="og:title" content="${label} Blog | DAO Essence">
    <meta property="og:url" content="${SITE_URL}/blog/${category}">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="DAO Essence">
    <link rel="canonical" href="${SITE_URL}/blog/${category}">
    <link rel="stylesheet" href="/styles.min.css?v=${CSS_VERSION}">
    <script src="/main.min.js?v=${CSS_VERSION}" defer></script>
    <style>
        .blog-category { max-width: 900px; margin: 0 auto; padding: 5rem 5% 4rem; }
        .blog-category-header { margin-bottom: 3rem; }
        .blog-category-header h1 { font-family: var(--font-display); font-size: clamp(1.8rem, 4vw, 2.6rem); color: var(--accent-color); letter-spacing: 0.08em; margin-bottom: 0.5rem; }
        .blog-category-header p { color: var(--text-secondary); font-size: 1.05rem; line-height: 1.7; }
        .blog-category-breadcrumb { font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1.5rem; }
        .blog-category-breadcrumb a { color: var(--accent-color); text-decoration: none; }
        .blog-category-breadcrumb a:hover { text-decoration: underline; }
        .blog-card-list { display: flex; flex-direction: column; gap: 1.5rem; }
        .blog-card { display: flex; flex-direction: row; background: rgba(212,175,55,0.03); border: 1px solid rgba(212,175,55,0.1); border-radius: 12px; text-decoration: none; transition: all 0.3s ease; overflow: hidden; }
        .blog-card:hover { background: rgba(212,175,55,0.06); border-color: rgba(212,175,55,0.25); transform: translateY(-2px); box-shadow: 0 8px 32px rgba(0,0,0,0.15); }
        .blog-card-image { width: 240px; min-width: 240px; aspect-ratio: 1.9 / 1; overflow: hidden; background: var(--bg-dark); }
        .blog-card-image img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.4s; }
        .blog-card:hover .blog-card-image img { transform: scale(1.05); }
        .blog-card-body { flex: 1; padding: 1.5rem 2rem; display: flex; flex-direction: column; justify-content: center; }
        .blog-card h2 { font-family: var(--font-display); font-size: 1.3rem; color: #1A1612; letter-spacing: 0.05em; margin-bottom: 0.6rem; transition: color 0.3s; }
        .blog-card:hover h2 { color: #1A1612; }
        .blog-card p { color: #555; font-size: 0.95rem; line-height: 1.7; margin-bottom: 1rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .blog-card-meta { display: flex; gap: 1rem; font-size: 0.82rem; color: #888; opacity: 0.7; }
        .blog-card-meta span { display: flex; align-items: center; gap: 0.3rem; }
        @media (max-width: 640px) {
            .blog-card { flex-direction: column; }
            .blog-card-image { width: 100%; min-width: unset; }
        }
        .blog-back-link { display: inline-flex; align-items: center; gap: 0.5rem; color: var(--accent-color); text-decoration: none; font-size: 0.9rem; margin-bottom: 2rem; opacity: 0.8; transition: opacity 0.3s; }
        .blog-back-link:hover { opacity: 1; text-decoration: underline; }
    </style>
</head>
<body>
${NAV_HTML}

    <main class="blog-category">
        <a href="/blog/" class="blog-back-link">← Back to Blog</a>
        <div class="blog-category-header">
            <p class="blog-category-breadcrumb"><a href="/">Home</a> / <a href="/blog/">Blog</a> / ${label}</p>
            <h1>${label}</h1>
            <p>Articles and guides on ${label} by DAO Essence.</p>
        </div>

        <div class="blog-card-list">
${cardHtml}
        </div>
    </main>

${FOOTER_HTML}
</body>
</html>`;
}

// ─── Generate Blog Index ────────────────────────────────────

function generateBlogIndex(allArticles) {
  // Group by category for latest section
  const latestCards = allArticles
    .sort((a, b) => new Date(b.data.date) - new Date(a.data.date))
    .slice(0, 8)
    .map(a => {
      const cat = a.data.category || 'bazi-astrology';
      const catLabel = CATEGORY_LABELS[cat] || cat;
      let imgSrc = a.data.image || SITE_URL + '/images/og-default.jpg';
      imgSrc = imgSrc.replace(/\/feature\/blog-cms\//g, '/main/');
      if (!imgSrc || imgSrc === '""') imgSrc = SITE_URL + '/images/og-default.jpg';
      return `
                <a href="/blog/${a.slug}" class="blog-card">
                    <div class="blog-card-image">
                        <img src="${imgSrc}" alt="${escapeHtml(a.data.title)}" loading="lazy" onerror="this.src='${SITE_URL}/images/og-default.jpg'">
                    </div>
                    <div class="blog-card-body">
                        <span class="blog-card-category">${catLabel}</span>
                        <h2>${escapeHtml(a.data.title)}</h2>
                        <p>${escapeHtml(a.data.description || '')}</p>
                        <div class="blog-card-meta">
                            <span>${escapeHtml(normalizeAuthor(a.data.author))}</span>
                            ${a.data.readTime ? `<span>·</span><span>${a.data.readTime} min read</span>` : ''}
                        </div>
                    </div>
                </a>`;
    }).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Blog | DAO Essence — Chinese Metaphysics & Taoist Wisdom</title>
    <meta name="description" content="Explore articles on BaZi astrology, Feng Shui, Five Elements theory, Taoist meditation, Chinese zodiac, and daily Chinese horoscopes.">
    <meta name="robots" content="index, follow">
    <meta property="og:title" content="Blog | DAO Essence">
    <meta property="og:url" content="${SITE_URL}/blog/">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="DAO Essence">
    <link rel="canonical" href="${SITE_URL}/blog/">
    <link rel="stylesheet" href="/styles.min.css?v=${CSS_VERSION}">
    <script src="/main.min.js?v=${CSS_VERSION}" defer></script>
    <style>
        .blog-home { max-width: 1200px; margin: 0 auto; padding: 7rem 2rem 4rem; }
        .blog-home-header { text-align: center; margin-bottom: 3.5rem; }
        .blog-home-header h1 { font-family: var(--font-display); font-size: clamp(2rem, 5vw, 2.8rem); color: var(--accent-color); letter-spacing: 0.1em; margin-bottom: 0.8rem; }
        .blog-home-header p { color: var(--text-secondary); font-size: 1.05rem; line-height: 1.7; max-width: 600px; margin: 0 auto; }
        .blog-main-layout { display: flex; gap: 2.5rem; align-items: flex-start; }
        .blog-main-content { flex: 1; min-width: 0; }
        .blog-section-title { font-family: var(--font-display); font-size: 1.4rem; color: var(--accent-color); letter-spacing: 0.08em; margin-bottom: 1.5rem; padding-bottom: 0.8rem; border-bottom: 1px solid rgba(212,175,55,0.15); }
        .blog-latest { margin-bottom: 2rem; }
        .blog-card-list { display: flex; flex-direction: column; gap: 1.5rem; }
        .blog-card { display: flex; flex-direction: row; background: rgba(212,175,55,0.03); border: 1px solid rgba(212,175,55,0.1); border-radius: 12px; text-decoration: none; transition: all 0.3s ease; overflow: hidden; }
        .blog-card:hover { background: rgba(212,175,55,0.06); border-color: rgba(212,175,55,0.25); transform: translateY(-2px); box-shadow: 0 8px 32px rgba(0,0,0,0.15); }
        .blog-card-image { width: 220px; min-width: 220px; aspect-ratio: 1.9 / 1; overflow: hidden; background: var(--bg-dark); }
        .blog-card-image img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.4s; }
        .blog-card:hover .blog-card-image img { transform: scale(1.05); }
        .blog-card-body { flex: 1; padding: 1.5rem 2rem; display: flex; flex-direction: column; justify-content: center; }
        .blog-card-category { display: inline-block; font-size: 0.72rem; color: var(--accent-color); letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 0.5rem; padding: 0.2rem 0.6rem; background: rgba(212,175,55,0.08); border-radius: 4px; }
        .blog-card h2 { font-family: var(--font-display); font-size: 1.25rem; color: #1A1612; letter-spacing: 0.05em; margin-bottom: 0.5rem; transition: color 0.3s; }
        .blog-card:hover h2 { color: #1A1612; }
        .blog-card p { color: #555; font-size: 0.92rem; line-height: 1.7; margin-bottom: 0.8rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .blog-card-meta { display: flex; gap: 1rem; font-size: 0.8rem; color: #888; opacity: 0.7; }

        /* Right sidebar */
        .blog-sidebar { width: 320px; min-width: 320px; position: sticky; top: 100px; }
        .blog-home-cta { position: relative; overflow: hidden; text-align: left; padding: 2.5rem 2rem; background: linear-gradient(160deg, #1A1208 0%, #2C2416 60%, #3D3422 100%); border: 1px solid rgba(212,175,55,0.25); border-radius: 16px; box-shadow: 0 12px 40px rgba(0,0,0,0.15); }
        .blog-home-cta::before { content: '\u262F'; position: absolute; top: -20px; right: 10px; font-size: 6rem; opacity: 0.04; color: #D4AF37; pointer-events: none; }
        .blog-home-cta::after { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, rgba(212,175,55,0.5), transparent); }
        .blog-home-cta h3 { font-family: var(--font-display); color: #D4AF37; font-size: 1.3rem; letter-spacing: 0.08em; margin-bottom: 0.5rem; position: relative; }
        .blog-home-cta .cta-sub { color: rgba(255,255,255,0.7); margin-bottom: 1.5rem; font-size: 0.92rem; line-height: 1.6; position: relative; }
        .blog-home-cta .cta-features { display: flex; flex-direction: column; gap: 0.6rem; margin-bottom: 1.5rem; position: relative; }
        .blog-home-cta .cta-feat { color: rgba(255,255,255,0.6); font-size: 0.85rem; display: flex; align-items: center; gap: 0.4rem; }
        .blog-home-cta .cta-feat span { color: #D4AF37; font-size: 1rem; }
        .blog-home-cta a { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.9rem 2rem; background: linear-gradient(135deg, #D4AF37, #E8C547); color: #1A1208; text-decoration: none; font-weight: 700; font-size: 0.95rem; letter-spacing: 0.05em; border-radius: 10px; transition: all 0.3s; position: relative; box-shadow: 0 4px 20px rgba(212,175,55,0.3); }
        .blog-home-cta a:hover { transform: translateY(-3px); box-shadow: 0 8px 32px rgba(212,175,55,0.5); background: linear-gradient(135deg, #E8C547, #F0D76A); }
        .blog-home-cta a::after { content: '\u2192'; font-size: 1.2rem; transition: transform 0.3s; }
        .blog-home-cta a:hover::after { transform: translateX(4px); }

        @media (max-width: 900px) {
            .blog-main-layout { flex-direction: column; }
            .blog-sidebar { width: 100%; min-width: unset; position: static; }
            .blog-home-cta { margin-top: 2rem; }
        }
        @media (max-width: 640px) {
            .blog-card { flex-direction: column; }
            .blog-card-image { width: 100%; min-width: unset; }
        }
    </style>
</head>
<body>
${NAV_HTML}

    <main class="blog-home">
        <div class="blog-home-header">
            <h1>Blog</h1>
            <p>Ancient wisdom meets modern insight. Explore articles on BaZi astrology, Feng Shui, meditation, and the Five Elements.</p>
        </div>

        <div class="blog-main-layout">
            <div class="blog-main-content">
                <section class="blog-latest">
                    <h2 class="blog-section-title">Latest Articles</h2>
                    <div class="blog-card-list">
${latestCards}
                    </div>
                </section>
            </div>

            <aside class="blog-sidebar">
                <div class="blog-home-cta">
                    <h3>Discover Your True Destiny</h3>
                    <p class="cta-sub">Unlock the secrets hidden in your birth chart. Get a complete BaZi reading with Four Pillars of Destiny analysis.</p>
                    <div class="cta-features">
                        <div class="cta-feat"><span>\u2728</span> Four Pillars Reading</div>
                        <div class="cta-feat"><span>\u2B50</span> Five Elements Analysis</div>
                        <div class="cta-feat"><span>\u{1F52E}</span> Life Path Insights</div>
                    </div>
                    <a href="/#free-bazi">Get Your Free BaZi Reading</a>
                </div>
            </aside>
        </div>
    </main>

${FOOTER_HTML}
</body>
</html>`;
}

// ─── Main Build ─────────────────────────────────────────────

async function main() {
  console.log('=== Blog Build Started ===');
  // Step 1: Clean and create dist/
  if (fs.existsSync(DIST_DIR)) {
    fs.rmSync(DIST_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(DIST_DIR, { recursive: true });
  fs.mkdirSync(DIST_BLOG_DIR, { recursive: true });

  // Step 2: Copy entire project to dist/ (excluding build artifacts)
  console.log('Copying project to dist/...');
  copyDirSync(SRC_DIR, DIST_DIR, [
    '.git', 'node_modules', 'dist', '.vercel',
    'build-blog.js', 'build-blog.cjs', 'package.json', 'package-lock.json',
    '.env', '.env.local', '.env.example', '.env.*.local',
    'docs', 'scripts'
  ]);

  // Step 2b: Copy almanac dependency (lunar-javascript) to dist/
  const lunarSrc = path.join(SRC_DIR, 'node_modules', 'lunar-javascript', 'lunar.js');
  const lunarDest = path.join(DIST_DIR, 'lunar.js');
  if (fs.existsSync(lunarSrc)) {
    fs.copyFileSync(lunarSrc, lunarDest);
    console.log('  Copied: lunar.js -> dist/lunar.js');
  } else {
    console.warn('  WARNING: lunar.js not found in node_modules, almanac page will not work');
  }

  // Step 2c: Clean up source files that shouldn't be in dist/
  const distPostsDir = path.join(DIST_DIR, 'blog', 'posts');
  if (fs.existsSync(distPostsDir)) {
    fs.rmSync(distPostsDir, { recursive: true, force: true });
    console.log('  Cleaned: dist/blog/posts/ (Markdown sources)');
  }

  // Step 3: Collect all articles from CMS
  let allArticles = [];

  // Read from blog/posts/ (main blog collection)
  const mainPosts = readAllMdFiles(POSTS_DIR);
  mainPosts.forEach(post => {
    // Fallback: some CMS-generated files put content in data.body instead of content area
    if (!post.content.trim() && post.data.body) {
      post.content = post.data.body;
    }
    allArticles.push({ ...post, category: post.data.category || 'bazi-astrology' });
  });

  // Note: All articles are now in blog/posts/ with a category field.
  // Category subfolders (blog/bazi-astrology/, etc.) are no longer used.

  console.log(`Found ${allArticles.length} articles total`);

  if (allArticles.length === 0) {
    console.error('ERROR: No articles found! Build will FAIL to prevent empty deploy.');
    console.error('  POSTS_DIR:', POSTS_DIR);
    console.error('  POSTS_DIR exists:', fs.existsSync(POSTS_DIR));
    if (fs.existsSync(POSTS_DIR)) {
      console.error('  Files in POSTS_DIR:', fs.readdirSync(POSTS_DIR));
    }
    console.error('  BLOG_DIR exists:', fs.existsSync(BLOG_DIR));
    if (fs.existsSync(BLOG_DIR)) {
      console.error('  Files in BLOG_DIR:', fs.readdirSync(BLOG_DIR));
    }
    process.exit(1); // FAIL the build so Vercel shows it as failed
  }

  // Step 4: Generate article HTML files in dist/blog/
  const usedSlugs = new Set();
  for (const post of allArticles) {
    const slug = generateSlug(post.filename, post.data, usedSlugs);
    post.slug = slug;

    const html = generateArticleHtml(post, post.category, allArticles);
    const outPath = path.join(DIST_BLOG_DIR, `${slug}.html`);
    fs.writeFileSync(outPath, html);
    console.log(`  Generated: dist/blog/${slug}.html`);
  }

  // Step 5: Group articles by category and generate category pages
  const byCategory = {};
  for (const post of allArticles) {
    const cat = post.category || 'bazi-astrology';
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(post);
  }

  // Generate category pages for ALL defined categories (even if empty)
  // This prevents nav links and sitemap entries from 404ing
  for (const cat of CATEGORY_FOLDERS) {
    const articles = byCategory[cat] || [];
    const html = generateCategoryHtml(cat, articles);
    const outPath = path.join(DIST_BLOG_DIR, `${cat}.html`);
    fs.writeFileSync(outPath, html);
    console.log(`  Updated: dist/blog/${cat}.html (${articles.length} articles)`);
  }

  // Step 6: Generate blog index
  const indexHtml = generateBlogIndex(allArticles);
  const indexPath = path.join(DIST_BLOG_DIR, 'index.html');
  fs.writeFileSync(indexPath, indexHtml);
  console.log(`  Updated: dist/blog/index.html`);

  // Step 6b: Generate bazi-recommendations.json for bazi result page sidebar
  console.log('Generating bazi-recommendations.json...');
  const recCount = Math.min(5, allArticles.length);
  // Shuffle and pick recCount articles
  const shuffled = [...allArticles].sort(() => Math.random() - 0.5);
  const recArticles = shuffled.slice(0, recCount).map(post => {
    const cat = post.category || post.data.category || 'bazi-astrology';
    const catLabel = CATEGORY_LABELS[cat] || cat;
    let imgSrc = post.data.image || SITE_URL + '/images/og-default.jpg';
    imgSrc = imgSrc.replace(/\/feature\/blog-cms\//g, '/main/');
    if (!imgSrc || imgSrc === '""') imgSrc = SITE_URL + '/images/og-default.jpg';
    const dateFormatted = formatDate(post.data.date);
    return {
      title: post.data.title || '',
      category: catLabel,
      description: post.data.description || '',
      image: imgSrc,
      readTime: post.data.readTime || 0,
      date: dateFormatted,
      slug: post.slug,
      url: SITE_URL + '/blog/' + post.slug
    };
  });
  const recJson = JSON.stringify(recArticles, null, 2);
  fs.writeFileSync(path.join(DIST_DIR, 'bazi-calculator', 'bazi-recommendations.json'), recJson);
  console.log(`  Generated: bazi-calculator/bazi-recommendations.json (${recCount} articles)`);

  // Step 7: Inject articles into homepage (pinned first, then latest)
  console.log('Injecting articles into homepage...');
  const homeIndexPath = path.join(DIST_DIR, 'index.html');
  if (fs.existsSync(homeIndexPath)) {
    let homeHtml = fs.readFileSync(homeIndexPath, 'utf-8');

    // Separate pinned and regular articles
    const pinnedArticles = allArticles.filter(a => a.data.pinned === true);
    const regularArticles = allArticles.filter(a => a.data.pinned !== true);

    // Deduplicate: remove pinned articles from regular list
    const pinnedSlugs = new Set(pinnedArticles.map(a => a.slug));
    const filteredRegular = regularArticles.filter(a => !pinnedSlugs.has(a.slug));

    // Sort regular articles by date (newest first)
    filteredRegular.sort((a, b) => new Date(b.data.date) - new Date(a.data.date));

    // Homepage shows up to 4 articles: pinned first, then fill with latest
    const homepageCount = 6;
    const regularCount = Math.max(0, homepageCount - pinnedArticles.length);
    const displayArticles = [
      ...pinnedArticles,
      ...filteredRegular.slice(0, regularCount)
    ];

    console.log(`  Pinned: ${pinnedArticles.length}, Regular: ${displayArticles.length - pinnedArticles.length}, Total: ${displayArticles.length}`);

    const cardsHtml = displayArticles.map(post => {
      const catLabel = CATEGORY_LABELS[post.category] || post.category || 'Blog';
      let imgSrc = post.data.image || SITE_URL + '/images/og-default.jpg';
      // Fix broken image paths (e.g. feature/blog-cms branch references)
      imgSrc = imgSrc.replace(/\/feature\/blog-cms\//g, '/main/');
      // Fallback for empty image
      if (!imgSrc || imgSrc === '""') imgSrc = SITE_URL + '/images/og-default.jpg';
      const dateStr = formatDate(post.data.date);
      return `                <a href="/blog/${post.slug}" class="article-card scroll-animate">
                    <div class="article-card-image">
                        <img src="${imgSrc}" alt="${escapeHtml(post.data.title)}" loading="lazy" onerror="this.src='${SITE_URL}/images/og-default.jpg'">
                    </div>
                    <div class="article-card-body">
                        <span class="article-card-category">${escapeHtml(catLabel)}</span>
                        <h3>${escapeHtml(post.data.title)}</h3>
                        <p>${escapeHtml(post.data.description || '')}</p>
                        <div class="article-card-meta">
                            <span>${escapeHtml(normalizeAuthor(post.data.author))}</span>
                            ${dateStr ? `<span>${dateStr}</span>` : ''}
                            ${post.data.readTime ? `<span>${post.data.readTime} min read</span>` : ''}
                        </div>
                    </div>
                </a>`;
    }).join('\n');
    homeHtml = homeHtml.replace(
      /<div class="articles-list">[\s\S]*?<\/div>\s*(<div class="articles-more">)/,
      `<div class="articles-list">\n${cardsHtml}\n            </div>\n            $1`
    );
    fs.writeFileSync(homeIndexPath, homeHtml);
    console.log(`  Updated: index.html (${displayArticles.length} articles: ${pinnedArticles.length} pinned + ${displayArticles.length - pinnedArticles.length} latest)`);
  }

  // Step 8: Generate dynamic sitemap.xml
  console.log('Generating sitemap.xml...');
  const today = new Date().toISOString().split('T')[0];
  const staticUrls = [
    { loc: '/', changefreq: 'weekly', priority: '1.0' },
    { loc: '/blog/', changefreq: 'weekly', priority: '1.0' },
    { loc: '/bazi-form', changefreq: 'weekly', priority: '1.0' },
    { loc: '/five-elements-test', changefreq: 'weekly', priority: '1.0' },
    { loc: '/soulmate-calculator', changefreq: 'weekly', priority: '1.0' },
    { loc: '/almanac', changefreq: 'daily', priority: '1.0' },
    { loc: '/culture', changefreq: 'monthly', priority: '0.8' },
    { loc: '/shop', changefreq: 'daily', priority: '0.6' },
    { loc: '/about', changefreq: 'monthly', priority: '0.6' },
    { loc: '/guide', changefreq: 'monthly', priority: '0.6' },
    { loc: '/destiny', changefreq: 'monthly', priority: '0.6' },
    { loc: '/privacy', changefreq: 'yearly', priority: '0.3' },
    { loc: '/terms', changefreq: 'yearly', priority: '0.3' },
  ];
  // Add category pages (only those that actually have articles)
  for (const cat of Object.keys(byCategory)) {
    staticUrls.push({ loc: `/blog/${cat}`, changefreq: 'weekly', priority: '0.7' });
  }
  let sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;
  for (const u of staticUrls) {
    sitemapXml += `    <url>
        <loc>${SITE_URL}${u.loc}</loc>
        <lastmod>${today}</lastmod>
        <changefreq>${u.changefreq}</changefreq>
        <priority>${u.priority}</priority>
    </url>\n`;
  }
  // Add blog articles from CMS
  for (const post of allArticles) {
    const d = post.data.date instanceof Date ? post.data.date.toISOString().split('T')[0] : String(post.data.date || today);
    sitemapXml += `    <url>
        <loc>${SITE_URL}/blog/${post.slug}</loc>
        <lastmod>${d}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
    </url>\n`;
  }
  sitemapXml += `</urlset>`;
  fs.writeFileSync(path.join(DIST_DIR, 'sitemap.xml'), sitemapXml);
  console.log(`  Generated: sitemap.xml (${staticUrls.length + allArticles.length} URLs)`);

  // Step 9: Generate clean URLs (create /about/index.html from /about.html)
  console.log('Generating clean URLs...');
  const htmlFiles = [];
  function collectHtmlFiles(dir) {
    for (const file of fs.readdirSync(dir)) {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) {
        collectHtmlFiles(fullPath);
      } else if (file.endsWith('.html') && file !== 'index.html') {
        htmlFiles.push(fullPath);
      }
    }
  }
  collectHtmlFiles(DIST_DIR);
  for (const htmlPath of htmlFiles) {
    const dirName = htmlPath.replace(/\.html$/, '');
    fs.mkdirSync(dirName, { recursive: true });
    fs.copyFileSync(htmlPath, path.join(dirName, 'index.html'));
    console.log(`  ${path.relative(DIST_DIR, htmlPath)} -> ${path.relative(DIST_DIR, dirName)}/index.html`);
  }

  // Step 10: Push URLs to IndexNow (Bing / Yandex / Naver)
  console.log('Notifying IndexNow...');
  const sitemapContent = fs.readFileSync(path.join(DIST_DIR, 'sitemap.xml'), 'utf-8');
  const sitemapUrls = [...sitemapContent.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1]);

  if (sitemapUrls.length > 0) {
    const indexNowPayload = {
      host: 'www.daoessentia.com',
      key: '5ad49cf218073b6e',
      urlList: sitemapUrls
    };

    try {
      const res = await fetch('https://api.indexnow.org/IndexNow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(indexNowPayload)
      });

      if (res.ok || res.status === 202) {
        console.log(`  ✅ IndexNow notified: ${sitemapUrls.length} URLs pushed to Bing/Yandex/Naver`);
      } else {
        console.warn(`  ⚠️ IndexNow returned status ${res.status}`);
      }
    } catch (err) {
      console.warn(`  ⚠️ IndexNow push failed: ${err.message}`);
    }
  }

  console.log('=== Blog Build Complete ===');
}

main();
