// ============================================
// Product Management & Display System
// ============================================

let allProducts = [];
let currentFilter = 'all';
let currentSort = 'featured';

// Load products from products.json
async function loadProducts() {
    try {
        const response = await fetch('products.json');
        const data = await response.json();
        allProducts = data.products;
        console.log('✅ Products loaded:', allProducts.length);
        renderShop();
    } catch (error) {
        console.error('Error loading products:', error);
        document.getElementById('productGrid').innerHTML = '<p style="color: red;">Error loading products</p>';
    }
}

// Filter products by category
function filterProducts(category) {
    currentFilter = category;
    
    // Update button states
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    renderShop();
}

// Sort products
function sortProducts(sortType) {
    currentSort = sortType;
    renderShop();
}

// Get filtered and sorted products
function getFilteredProducts() {
    let filtered = allProducts;
    
    // Apply filter
    if (currentFilter !== 'all') {
        filtered = filtered.filter(p => p.category === currentFilter);
    }
    
    // Apply sort
    switch (currentSort) {
        case 'price-low':
            filtered.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            filtered.sort((a, b) => b.price - a.price);
            break;
        case 'newest':
            filtered.sort((a, b) => (b.id || '').localeCompare(a.id || ''));
            break;
        case 'featured':
        default:
            // Keep original order
            break;
    }
    
    return filtered;
}

// Render shop products
function renderShop() {
    const filtered = getFilteredProducts();
    const grid = document.getElementById('productGrid');
    
    // Update product count
    document.getElementById('productCount').textContent = filtered.length;
    
    grid.innerHTML = filtered.map(product => `
        <div class="shop-product-card">
            <div class="product-image-wrapper">
                <img src="${product.image}" alt="${product.nameCN}" onerror="this.src='images/placeholder.png'">
                <div class="product-element">
                    <span class="element-badge">${product.element.toUpperCase()}</span>
                </div>
            </div>
            <div class="product-info">
                <div class="product-category">${product.category}</div>
                <div class="product-title">${product.nameCN}</div>
                <div class="product-desc-short">${product.descriptionCN}</div>
                <div class="product-meta">
                    <div class="product-price">$${product.price.toFixed(2)}</div>
                    <div class="product-stock">Stock: ${product.stock}</div>
                </div>
                <button class="add-to-cart-btn" onclick="addToCart('${product.id}')">
                    🛒 Add to Cart
                </button>
            </div>
        </div>
    `).join('');
}

// Add style for add-to-cart button
const style = document.createElement('style');
style.textContent = `
    .add-to-cart-btn {
        width: 100%;
        padding: 12px 16px;
        background: var(--primary-color, #D4AF37);
        color: var(--bg-dark, #1A1612);
        border: none;
        border-radius: var(--radius-sm, 8px);
        cursor: pointer;
        font-size: 14px;
        font-weight: 600;
        transition: all var(--transition-fast, 0.2s);
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }
    
    .add-to-cart-btn:hover {
        background: var(--fire-light, #CD853F);
        transform: translateY(-2px);
    }
`;
document.head.appendChild(style);

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
});
