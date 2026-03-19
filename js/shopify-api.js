/**
 * Shopify Storefront API 封装
 * 
 * 功能：
 * - 获取商品列表
 * - 获取商品详情
 * - 购物车操作
 * - 结账流程
 */

// ============================================
// 核心请求函数
// ============================================

async function shopifyFetch(query, variables = {}) {
    const response = await fetch(STOREFRONT_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Storefront-Access-Token': SHOPIFY_CONFIG.storefrontAccessToken,
            ...(SHOPIFY_CONFIG.language && { 'Accept-Language': SHOPIFY_CONFIG.language })
        },
        body: JSON.stringify({ query, variables })
    });

    const result = await response.json();
    
    if (result.errors) {
        console.error('Shopify API Error:', result.errors);
        throw new Error(result.errors[0].message);
    }

    return result.data;
}

// ============================================
// 商品相关 API
// ============================================

/**
 * 获取所有商品列表
 */
async function getAllProducts() {
    const query = `
        query getAllProducts {
            products(first: 100) {
                edges {
                    node {
                        id
                        title
                        handle
                        description
                        descriptionHtml
                        productType
                        vendor
                        tags
                        availableForSale
                        priceRange {
                            minVariantPrice {
                                amount
                                currencyCode
                            }
                            maxVariantPrice {
                                amount
                                currencyCode
                            }
                        }
                        images(first: 10) {
                            edges {
                                node {
                                    id
                                    url
                                    altText
                                    width
                                    height
                                }
                            }
                        }
                        variants(first: 50) {
                            edges {
                                node {
                                    id
                                    title
                                    availableForSale
                                    price {
                                        amount
                                        currencyCode
                                    }
                                    compareAtPrice {
                                        amount
                                        currencyCode
                                    }
                                    selectedOptions {
                                        name
                                        value
                                    }
                                    image {
                                        id
                                        url
                                        altText
                                    }
                                }
                            }
                        }
                        metafields(identifiers: [
                            { namespace: "custom", key: "material" },
                            { namespace: "custom", key: "energy_type" },
                            { namespace: "custom", key: "usage_scenario" },
                            { namespace: "custom", key: "care_instructions" },
                            { namespace: "custom", key: "origin" },
                            { namespace: "custom", key: "size_chart" },
                            { namespace: "custom", key: "weight" },
                            { namespace: "custom", key: "dimensions" }
                        ]) {
                            id
                            namespace
                            key
                            value
                            type
                        }
                    }
                }
            }
        }
    `;

    const data = await shopifyFetch(query);
    return data.products.edges.map(edge => edge.node);
}

/**
 * 根据分类获取商品
 */
async function getProductsByCollection(collectionHandle) {
    const query = `
        query getProductsByCollection($handle: String!) {
            collection(handle: $handle) {
                id
                title
                products(first: 100) {
                    edges {
                        node {
                            id
                            title
                            handle
                            description
                            availableForSale
                            priceRange {
                                minVariantPrice {
                                    amount
                                    currencyCode
                                }
                            }
                            images(first: 5) {
                                edges {
                                    node {
                                        id
                                        url
                                        altText
                                    }
                                }
                            }
                            variants(first: 20) {
                                edges {
                                    node {
                                        id
                                        title
                                        price {
                                            amount
                                            currencyCode
                                        }
                                        availableForSale
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    `;

    const data = await shopifyFetch(query, { handle: collectionHandle });
    return data.collection ? data.collection.products.edges.map(edge => edge.node) : [];
}

/**
 * 获取单个商品详情
 */
async function getProductByHandle(handle) {
    const query = `
        query getProductByHandle($handle: String!) {
            product(handle: $handle) {
                id
                title
                handle
                description
                descriptionHtml
                productType
                vendor
                tags
                availableForSale
                priceRange {
                    minVariantPrice {
                        amount
                        currencyCode
                    }
                    maxVariantPrice {
                        amount
                        currencyCode
                    }
                }
                images(first: 20) {
                    edges {
                        node {
                            id
                            url
                            altText
                            width
                            height
                        }
                    }
                }
                variants(first: 100) {
                    edges {
                        node {
                            id
                            title
                            availableForSale
                            price {
                                amount
                                currencyCode
                            }
                            compareAtPrice {
                                amount
                                currencyCode
                            }
                            selectedOptions {
                                name
                                value
                            }
                            image {
                                id
                                url
                                altText
                            }
                        }
                    }
                }
                metafields(identifiers: [
                    { namespace: "custom", key: "material" },
                    { namespace: "custom", key: "energy_type" },
                    { namespace: "custom", key: "usage_scenario" },
                    { namespace: "custom", key: "care_instructions" },
                    { namespace: "custom", key: "origin" },
                    { namespace: "custom", key: "size_chart" },
                    { namespace: "custom", key: "weight" },
                    { namespace: "custom", key: "dimensions" },
                    { namespace: "custom", key: "features" }
                ]) {
                    id
                    namespace
                    key
                    value
                    type
                }
                options {
                    id
                    name
                    values
                }
            }
        }
    `;

    const data = await shopifyFetch(query, { handle });
    return data.product;
}

/**
 * 搜索商品
 */
async function searchProducts(searchTerm) {
    const query = `
        query searchProducts($query: String!) {
            search(query: $query, types: PRODUCT, first: 50) {
                edges {
                    node {
                        ... on Product {
                            id
                            title
                            handle
                            description
                            availableForSale
                            priceRange {
                                minVariantPrice {
                                    amount
                                    currencyCode
                                }
                            }
                            images(first: 3) {
                                edges {
                                    node {
                                        id
                                        url
                                        altText
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    `;

    const data = await shopifyFetch(query, { query: searchTerm });
    return data.search.edges.map(edge => edge.node);
}

// ============================================
// 购物车相关 API
// ============================================

/**
 * 创建购物车
 */
async function createCart() {
    const mutation = `
        mutation createCart {
            cartCreate {
                cart {
                    id
                    checkoutUrl
                    lines(first: 100) {
                        edges {
                            node {
                                id
                                quantity
                                merchandise {
                                    ... on ProductVariant {
                                        id
                                        title
                                        price {
                                            amount
                                            currencyCode
                                        }
                                        product {
                                            title
                                            handle
                                        }
                                        image {
                                            url
                                            altText
                                        }
                                    }
                                }
                            }
                        }
                    }
                    cost {
                        totalAmount {
                            amount
                            currencyCode
                        }
                        subtotalAmount {
                            amount
                            currencyCode
                        }
                    }
                }
                userErrors {
                    field
                    message
                }
            }
        }
    `;

    const data = await shopifyFetch(mutation);
    
    if (data.cartCreate.userErrors.length > 0) {
        throw new Error(data.cartCreate.userErrors[0].message);
    }

    return data.cartCreate.cart;
}

/**
 * 获取购物车
 */
async function getCart(cartId) {
    const query = `
        query getCart($cartId: ID!) {
            cart(id: $cartId) {
                id
                checkoutUrl
                lines(first: 100) {
                    edges {
                        node {
                            id
                            quantity
                            merchandise {
                                ... on ProductVariant {
                                    id
                                    title
                                    price {
                                        amount
                                        currencyCode
                                    }
                                    product {
                                        title
                                        handle
                                    }
                                    image {
                                        url
                                        altText
                                    }
                                }
                            }
                        }
                    }
                }
                cost {
                    totalAmount {
                        amount
                        currencyCode
                    }
                    subtotalAmount {
                        amount
                        currencyCode
                    }
                    totalTaxAmount {
                        amount
                        currencyCode
                    }
                }
            }
        }
    `;

    const data = await shopifyFetch(query, { cartId });
    return data.cart;
}

/**
 * 添加商品到购物车
 */
async function addToCart(cartId, variantId, quantity = 1) {
    const mutation = `
        mutation addToCart($cartId: ID!, $lines: [CartLineInput!]!) {
            cartLinesAdd(cartId: $cartId, lines: $lines) {
                cart {
                    id
                    lines(first: 100) {
                        edges {
                            node {
                                id
                                quantity
                                merchandise {
                                    ... on ProductVariant {
                                        id
                                        title
                                        price {
                                            amount
                                            currencyCode
                                        }
                                        product {
                                            title
                                        }
                                        image {
                                            url
                                        }
                                    }
                                }
                            }
                        }
                    }
                    cost {
                        totalAmount {
                            amount
                            currencyCode
                        }
                    }
                }
                userErrors {
                    field
                    message
                }
            }
        }
    `;

    const variables = {
        cartId,
        lines: [{ merchandiseId: variantId, quantity }]
    };

    const data = await shopifyFetch(mutation, variables);

    if (data.cartLinesAdd.userErrors.length > 0) {
        throw new Error(data.cartLinesAdd.userErrors[0].message);
    }

    return data.cartLinesAdd.cart;
}

/**
 * 更新购物车商品数量
 */
async function updateCartLine(cartId, lineId, quantity) {
    const mutation = `
        mutation updateCartLine($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
            cartLinesUpdate(cartId: $cartId, lines: $lines) {
                cart {
                    id
                    lines(first: 100) {
                        edges {
                            node {
                                id
                                quantity
                                merchandise {
                                    ... on ProductVariant {
                                        id
                                        title
                                        price {
                                            amount
                                            currencyCode
                                        }
                                        product {
                                            title
                                        }
                                    }
                                }
                            }
                        }
                    }
                    cost {
                        totalAmount {
                            amount
                            currencyCode
                        }
                    }
                }
                userErrors {
                    field
                    message
                }
            }
        }
    `;

    const variables = {
        cartId,
        lines: [{ id: lineId, quantity }]
    };

    const data = await shopifyFetch(mutation, variables);

    if (data.cartLinesUpdate.userErrors.length > 0) {
        throw new Error(data.cartLinesUpdate.userErrors[0].message);
    }

    return data.cartLinesUpdate.cart;
}

/**
 * 从购物车移除商品
 */
async function removeFromCart(cartId, lineIds) {
    const mutation = `
        mutation removeFromCart($cartId: ID!, $lineIds: [ID!]!) {
            cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
                cart {
                    id
                    lines(first: 100) {
                        edges {
                            node {
                                id
                                quantity
                                merchandise {
                                    ... on ProductVariant {
                                        id
                                        title
                                        product {
                                            title
                                        }
                                    }
                                }
                            }
                        }
                    }
                    cost {
                        totalAmount {
                            amount
                            currencyCode
                        }
                    }
                }
                userErrors {
                    field
                    message
                }
            }
        }
    `;

    const data = await shopifyFetch(mutation, { cartId, lineIds });

    if (data.cartLinesRemove.userErrors.length > 0) {
        throw new Error(data.cartLinesRemove.userErrors[0].message);
    }

    return data.cartLinesRemove.cart;
}

// ============================================
// 结账相关 API
// ============================================

/**
 * 获取结账 URL（跳转到 Shopify 托管结账页面）
 */
function getCheckoutUrl(cartId) {
    return new Promise(async (resolve, reject) => {
        try {
            const cart = await getCart(cartId);
            if (cart && cart.checkoutUrl) {
                resolve(cart.checkoutUrl);
            } else {
                reject(new Error('无法获取结账链接'));
            }
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * 更新购物车买家信息（邮箱、地址等）
 */
async function updateCartBuyerIdentity(cartId, email, countryCode = 'US') {
    const mutation = `
        mutation updateCartBuyerIdentity($cartId: ID!, $buyerIdentity: CartBuyerIdentityInput!) {
            cartBuyerIdentityUpdate(cartId: $cartId, buyerIdentity: $buyerIdentity) {
                cart {
                    id
                    buyerIdentity {
                        email
                        countryCode
                    }
                }
                userErrors {
                    field
                    message
                }
            }
        }
    `;

    const variables = {
        cartId,
        buyerIdentity: {
            email,
            countryCode
        }
    };

    const data = await shopifyFetch(mutation, variables);

    if (data.cartBuyerIdentityUpdate.userErrors.length > 0) {
        throw new Error(data.cartBuyerIdentityUpdate.userErrors[0].message);
    }

    return data.cartBuyerIdentityUpdate.cart;
}

// ============================================
// 辅助函数
// ============================================

/**
 * 格式化价格
 */
function formatPrice(amount, currencyCode = 'USD') {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currencyCode
    }).format(amount);
}

/**
 * 获取 Metafield 值
 */
function getMetafieldValue(product, key) {
    if (!product.metafields) return null;
    const metafield = product.metafields.find(m => m.key === key);
    return metafield ? metafield.value : null;
}

/**
 * 获取商品的主图
 */
function getMainImage(product) {
    if (product.images && product.images.edges.length > 0) {
        return product.images.edges[0].node;
    }
    return null;
}

/**
 * 获取商品的所有图片
 */
function getAllImages(product) {
    if (product.images && product.images.edges.length > 0) {
        return product.images.edges.map(edge => edge.node);
    }
    return [];
}

/**
 * 获取商品规格选项（颜色、尺寸等）
 */
function getProductOptions(product) {
    if (product.options) {
        return product.options.map(option => ({
            name: option.name,
            values: option.values
        }));
    }
    return [];
}

/**
 * 根据选项值查找对应的 Variant
 */
function findVariantByOptions(product, selectedOptions) {
    if (!product.variants) return null;
    
    for (const edge of product.variants.edges) {
        const variant = edge.node;
        const variantOptions = variant.selectedOptions || [];
        
        let match = true;
        for (const [optionName, optionValue] of Object.entries(selectedOptions)) {
            const variantOption = variantOptions.find(o => o.name === optionName);
            if (!variantOption || variantOption.value !== optionValue) {
                match = false;
                break;
            }
        }
        
        if (match) return variant;
    }
    
    return null;
}

// ============================================
// 本地购物车存储（与 Shopify 同步）
// ============================================

const CART_STORAGE_KEY = 'shopify_cart_id';

/**
 * 获取或创建购物车 ID
 */
async function getOrCreateCartId() {
    let cartId = localStorage.getItem(CART_STORAGE_KEY);
    
    if (cartId) {
        try {
            const cart = await getCart(cartId);
            if (cart) return cartId;
        } catch (error) {
            console.log('购物车已过期，创建新购物车');
        }
    }
    
    // 创建新购物车
    const newCart = await createCart();
    localStorage.setItem(CART_STORAGE_KEY, newCart.id);
    return newCart.id;
}

/**
 * 清除本地购物车
 */
function clearLocalCart() {
    localStorage.removeItem(CART_STORAGE_KEY);
}

// 导出（如果使用模块化）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        shopifyFetch,
        getAllProducts,
        getProductsByCollection,
        getProductByHandle,
        searchProducts,
        createCart,
        getCart,
        addToCart,
        updateCartLine,
        removeFromCart,
        getCheckoutUrl,
        updateCartBuyerIdentity,
        formatPrice,
        getMetafieldValue,
        getMainImage,
        getAllImages,
        getProductOptions,
        findVariantByOptions,
        getOrCreateCartId,
        clearLocalCart
    };
}
