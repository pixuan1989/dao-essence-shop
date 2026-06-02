const fs = require('fs');
const html = fs.readFileSync('dist/wallpaper-detail.html', 'utf-8');
const wallpapers = JSON.parse(fs.readFileSync('wallpapers.json', 'utf-8'));

console.log('=== Wallpaper Detail Page SEO Analysis ===\n');

// Check static HTML SEO
console.log('📄 Static HTML (before JS execution):');
const descMatch = html.match(/<meta name="description" content="([^"]*)"/);
if (descMatch) {
    const desc = descMatch[1];
    console.log(`   Meta Description: "${desc}" (${desc.length} chars)`);
    console.log(`   Status: ${desc.length >= 120 ? '✅' : '⚠️ Too short for SEO'}`);
}

const ogImageMatch = html.match(/<meta property="og:image" content="([^"]*)"/);
if (ogImageMatch) {
    const ogImage = ogImageMatch[1];
    console.log(`   OG Image: "${ogImage || '(empty)'}"`);
    console.log(`   Status: ${ogImage ? '✅' : '⚠️ Empty (relies on JS)'}`);
}

// Check dynamic SEO update
console.log('\n🔄 Dynamic SEO (after JS execution):');
if (html.includes("document.querySelector('meta[property=\"og:image\"]').content = data.original")) {
    console.log('   OG Image: Set to data.original (full PNG)');
    console.log('   Status: ⚠️ Should use data.thumb for social sharing efficiency');
    console.log('   Reason: Full PNG may be too large for Twitter/Facebook cards');
}

if (html.includes("document.querySelector('meta[name=\"description\"]').content = data.description")) {
    console.log('   Meta Description: Set to data.description');
    console.log('   Status: ✅ Good (uses full wallpaper description from JSON)');
}

// Check actual wallpaper data
console.log('\n📊 Actual Wallpaper Data:');
wallpapers.forEach((wp, i) => {
    console.log(`\n   Wallpaper ${i+1}: ${wp.id}`);
    console.log(`   Title: "${wp.title}" (${wp.title.length} chars)`);
    console.log(`   Description length: ${wp.description.length} chars / ${wp.description.split(/\s+/).length} words`);
    console.log(`   Original: ${wp.original}`);
    console.log(`   Thumbnail: ${wp.thumb}`);
    
    // SEO recommendations
    if (wp.description.split(/\s+/).length < 150) {
        console.log('   ⚠️ Description too short for SEO (recommended 150+ words)');
    } else {
        console.log('   ✅ Description length good for SEO');
    }
});

// Recommendations
console.log('\n Recommendations:');
console.log('   1. Change OG image from data.original to data.thumb');
console.log('      - Social media platforms prefer smaller images');
console.log('      - thumb.webp is optimized for sharing');
console.log('   2. Ensure meta description is 120-160 characters for optimal display');
console.log('   3. Current description is dynamically set from JSON (good)');
console.log('   4. Consider adding static fallback description in HTML for non-JS crawlers');
