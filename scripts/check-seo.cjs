const fs = require('fs');
const html = fs.readFileSync('dist/wallpaper-detail.html', 'utf-8');

console.log('=== SEO Meta Tags Check ===\n');

// 1. Meta Description
console.log('1. Meta Description:');
const descMatch = html.match(/<meta name="description" content="([^"]*)"/);
if (descMatch) {
    const desc = descMatch[1];
    console.log('   Content:', desc.substring(0, 80) + '...');
    console.log('   Length:', desc.length, 'characters');
    if (desc.length >= 120 && desc.length <= 160) {
        console.log('   Status: ✅ Optimal (120-160 chars)');
    } else if (desc.length < 120) {
        console.log('   Status: ️ Too short (recommended 120-160 chars)');
    } else {
        console.log('   Status: ⚠️ Too long (recommended 120-160 chars)');
    }
} else {
    console.log('   ❌ Not found');
}

// 2. OG Image
console.log('\n2. OG Image:');
const ogImageMatch = html.match(/<meta property="og:image" content="([^"]*)"/);
if (ogImageMatch) {
    const ogImage = ogImageMatch[1];
    console.log('   Content:', ogImage);
    if (ogImage.includes('thumb.webp') || ogImage.includes('thumb.jpg')) {
        console.log('   Status: ✅ Points to thumbnail (correct for social sharing)');
    } else if (ogImage.includes('original.png')) {
        console.log('   Status: ⚠️ Points to full-size image (may be too large for social sharing)');
    } else if (ogImage === '') {
        console.log('   Status:  Empty (will be set dynamically by JS)');
    } else {
        console.log('   Status: ⚠️ Unknown image type');
    }
} else {
    console.log('    Not found');
}

// 3. OG Title
console.log('\n3. OG Title:');
const ogTitleMatch = html.match(/<meta property="og:title" content="([^"]*)"/);
if (ogTitleMatch) {
    console.log('   Content:', ogTitleMatch[1]);
} else {
    console.log('   ❌ Not found');
}

// 4. OG Description
console.log('\n4. OG Description:');
const ogDescMatch = html.match(/<meta property="og:description" content="([^"]*)"/);
if (ogDescMatch) {
    console.log('   Content:', ogDescMatch[1].substring(0, 80) + '...');
    console.log('   Length:', ogDescMatch[1].length, 'characters');
} else {
    console.log('    Not found');
}

// 5. Check if OG image is dynamically set
console.log('\n5. Dynamic OG Image Setting:');
if (html.includes("document.querySelector('meta[property=\"og:image\"]').content")) {
    console.log('   ✅ OG image is set dynamically via JS (good for detail pages)');
} else {
    console.log('   ⚠️ OG image may not be dynamically updated');
}

// 6. Check title length
console.log('\n6. Page Title:');
const titleMatch = html.match(/<title>([^<]*)<\/title>/);
if (titleMatch) {
    const title = titleMatch[1];
    console.log('   Content:', title);
    console.log('   Length:', title.length, 'characters');
    if (title.length >= 50 && title.length <= 60) {
        console.log('   Status: ✅ Optimal (50-60 chars for SEO)');
    } else {
        console.log('   Status: ⚠️ May need optimization (recommended 50-60 chars)');
    }
}
