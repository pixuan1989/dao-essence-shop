// ========================================
// Shop Page Diagnostics Script
// ========================================

console.log('\n' + '='.repeat(50));
console.log('🔍 SHOP PAGE DIAGNOSTICS');
console.log('='.repeat(50) + '\n');

// 1. Check if shop-manager.js loaded
console.log('1️⃣ shop-manager.js Status:');
console.log('   - typeof loadProducts:', typeof loadProducts);
console.log('   - typeof filterProducts:', typeof filterProducts);
console.log('   - typeof sortProducts:', typeof sortProducts);
console.log('   - typeof allProducts:', typeof allProducts);
console.log('   - allProducts length:', Array.isArray(allProducts) ? allProducts.length : 'NOT AN ARRAY');

// 2. Check embedded products
if (typeof embeddedProducts !== 'undefined') {
    console.log('\n2️⃣ embeddedProducts Status:');
    console.log('   - exists:', true);
    console.log('   - products count:', embeddedProducts.products.length);
    console.log('   - first product:', embeddedProducts.products[0]?.id);
} else {
    console.log('\n2️⃣ embeddedProducts Status: ❌ NOT DEFINED');
}

// 3. Check product grid
const productGrid = document.getElementById('productGrid');
console.log('\n3️⃣ Product Grid:');
console.log('   - exists:', !!productGrid);
console.log('   - innerHTML length:', productGrid?.innerHTML.length || 0);
console.log('   - children count:', productGrid?.children.length || 0);

// 4. Check filter buttons
const filterBtns = document.querySelectorAll('.filter-btn');
console.log('\n4️⃣ Filter Buttons:');
console.log('   - count:', filterBtns.length);
filterBtns.forEach((btn, idx) => {
    console.log(`   - btn ${idx}: "${btn.textContent.trim()}"`);
});

// 5. Check cart functions
console.log('\n5️⃣ Cart Functions:');
console.log('   - typeof addToCart:', typeof addToCart);
console.log('   - typeof cart:', typeof cart);
if (typeof cart === 'object') {
    console.log('   - cart.items count:', cart.items?.length || 0);
}

// 6. Check render function
console.log('\n6️⃣ Render Functions:');
console.log('   - typeof renderShop:', typeof renderShop);
console.log('   - typeof getFilteredProducts:', typeof getFilteredProducts);

// 7. Test loading
console.log('\n7️⃣ Testing loadProducts():');
if (typeof loadProducts === 'function') {
    console.log('   - Calling loadProducts()...');
    loadProducts().catch(err => console.error('   - Error:', err));
} else {
    console.log('   - ❌ loadProducts is not a function!');
}

console.log('\n' + '='.repeat(50));
console.log('✅ DIAGNOSTICS COMPLETE');
console.log('='.repeat(50) + '\n');

// Make diagnostics globally available
window.SHOP_DIAGNOSTICS = {
    loadProducts,
    filterProducts,
    sortProducts,
    allProducts,
    embeddedProducts,
    productGrid,
    filterBtns,
    reloadProducts: () => {
        console.log('🔄 Reloading products...');
        allProducts = [];
        loadProducts();
    }
};

console.log('💡 Available commands in console:');
console.log('   - SHOP_DIAGNOSTICS.reloadProducts()');
console.log('   - SHOP_DIAGNOSTICS.filterProducts("crystals")');
console.log('   - SHOP_DIAGNOSTICS.sortProducts("price-low")');
