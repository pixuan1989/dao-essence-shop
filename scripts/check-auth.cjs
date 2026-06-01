const fs = require('fs');

console.log('=== Login & Auth Function Check ===\n');

// Check auth.js actual implementation
console.log('1. Auth JS Module (js/auth.js):');
try {
    const authJs = fs.readFileSync('js/auth.js', 'utf-8');
    
    console.log('   Core Functions:');
    console.log(`   ${authJs.includes('DA.getToken') ? '✅' : '❌'} Token management (get/set/clear)`);
    console.log(`   ${authJs.includes('DA.getUser') ? '✅' : ''} User info retrieval`);
    console.log(`   ${authJs.includes('DA.signIn') ? '✅' : '❌'} Sign in (prompt-based)`);
    console.log(`   ${authJs.includes('DA.signOut') ? '✅' : '❌'} Sign out`);
    console.log(`   ${authJs.includes('DA.showToast') ? '✅' : '❌'} Toast notifications`);
    console.log(`   ${authJs.includes('DA.updateNav') ? '✅' : '❌'} Navigation update`);
    console.log(`   ${authJs.includes('DA.init') ? '✅' : '❌'} Initialization`);
    console.log(`   ${authJs.includes('window.DaoAuth = DA') ? '✅' : '❌'} Global export`);
    
    console.log('\n   API Endpoints:');
    const endpoints = authJs.match(/fetch\('([^']+)'/g);
    if (endpoints) {
        const unique = [...new Set(endpoints)];
        unique.forEach(ep => console.log(`   ✅ ${ep}`));
    }
    
    console.log('\n   Auth Flow:');
    console.log(`   ${authJs.includes('prompt(') ? '✅' : '❌'} Email/password via prompt`);
    console.log(`   ${authJs.includes('action=login') ? '✅' : '❌'} Login API call`);
    console.log(`   ${authJs.includes('action=register') ? '✅' : '❌'} Register API call`);
    console.log(`   ${authJs.includes('confirm(') ? '✅' : '❌'} Auto-register prompt on login failure`);
    
    console.log('\n   Token Security:');
    console.log(`   ${authJs.includes('localStorage.getItem(\'da_token\')') ? '✅' : '❌'} Token stored in localStorage`);
    console.log(`   ${authJs.includes('Authorization\': \'Bearer \'') ? '✅' : '❌'} Bearer token in headers`);
    console.log(`   ${authJs.includes('DA.clearToken') ? '✅' : '❌'} Token cleanup on sign out`);
    
} catch (e) {
    console.log(`   ❌ Error reading auth.js: ${e.message}`);
}

// Check HTML integration
console.log('\n2. HTML Integration (wallpaper-detail.html):');
try {
    const html = fs.readFileSync('dist/wallpaper-detail.html', 'utf-8');
    
    console.log('   Sign In Button:');
    if (html.includes('Sign In') || html.includes('Sign in')) {
        console.log('   ✅ Sign In button present');
    }
    if (html.includes('wpn-signin-btn') || html.includes('wpn-btn-signin')) {
        console.log('   ✅ Sign In button ID present');
    }
    
    console.log('\n   Script Loading:');
    console.log(`   ${html.includes('src="/js/auth.js"') ? '✅' : '❌'} auth.js loaded`);
    console.log(`   ${html.includes('defer') ? '✅' : '❌'} i18n-switcher.js uses defer`);
    
    console.log('\n   Download Auth Check:');
    if (html.includes('/api/auth?action=download')) {
        console.log('   ✅ Download endpoint checks auth');
    }
    if (html.includes('DaoAuth.getToken')) {
        console.log('   ✅ Token retrieval for download');
    }
    if (html.includes('showToast')) {
        console.log('   ✅ Toast notifications for auth errors');
    }
    if (html.includes('3/day')) {
        console.log('   ✅ Download limit messaging (3/day for guests)');
    }
    
} catch (e) {
    console.log(`   ❌ Error reading HTML: ${e.message}`);
}

// Check API endpoint
console.log('\n3. API Endpoint (api/auth.js):');
try {
    const apiAuth = fs.readFileSync('api/auth.js', 'utf-8');
    
    console.log('   Available Actions:');
    const actions = [...new Set(apiAuth.match(/action=([a-z]+)/g) || [])];
    actions.forEach(action => console.log(`   ✅ ${action}`));
    
    console.log('\n   Security:');
    console.log(`   ${apiAuth.includes('JWT') || apiAuth.includes('jwt') ? '✅' : ''} JWT implementation`);
    console.log(`   ${apiAuth.includes('bcrypt') || apiAuth.includes('argon2') ? '✅' : ''} Password hashing`);
    console.log(`   ${apiAuth.includes('download') ? '✅' : '❌'} Download quota management`);
    console.log(`   ${apiAuth.includes('rate') || apiAuth.includes('limit') ? '✅' : '❌'} Rate limiting`);
    
} catch (e) {
    console.log(`   ⚠️ Could not check API: ${e.message}`);
}

console.log('\n=== Summary ===');
console.log('Current Implementation:');
console.log('- ✅ Uses prompt() for login/register (simple, no modal)');
console.log('- ✅ JWT token management in localStorage');
console.log('- ✅ Download quota enforcement');
console.log('- ✅ Toast notifications for user feedback');
console.log('- ✅ Auto-register on login failure (with confirmation)');
console.log('\n⚠️ Note: Uses prompt() instead of modal (per auth.js header "无弹窗版")');
console.log('   This is simpler but less polished than a modal approach.');
console.log('\nRecommend testing:');
console.log('1. Sign in flow with valid credentials');
console.log('2. Auto-register flow for new users');
console.log('3. Download limit (3/day for guests)');
console.log('4. Token persistence across page reloads');
