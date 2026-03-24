// 调试CSS隐藏问题的脚本
function debugCSS() {
    console.log('=== Debugging CSS issues ===');
    
    // 检查 mainImageWrapper
    const wrapper = document.getElementById('mainImageWrapper');
    if (wrapper) {
        console.log('Wrapper element:', wrapper);
        console.log('Wrapper display:', getComputedStyle(wrapper).display);
        console.log('Wrapper visibility:', getComputedStyle(wrapper).visibility);
        console.log('Wrapper opacity:', getComputedStyle(wrapper).opacity);
        console.log('Wrapper width:', wrapper.offsetWidth);
        console.log('Wrapper height:', wrapper.offsetHeight);
        console.log('Wrapper offsetTop:', wrapper.offsetTop);
        console.log('Wrapper offsetLeft:', wrapper.offsetLeft);
        
        // 检查父元素
        const parent = wrapper.parentElement;
        if (parent) {
            console.log('Parent element:', parent);
            console.log('Parent class:', parent.className);
            console.log('Parent display:', getComputedStyle(parent).display);
            console.log('Parent visibility:', getComputedStyle(parent).visibility);
            console.log('Parent opacity:', getComputedStyle(parent).opacity);
            console.log('Parent width:', parent.offsetWidth);
            console.log('Parent height:', parent.offsetHeight);
            
            // 检查祖父元素
            const grandparent = parent.parentElement;
            if (grandparent) {
                console.log('Grandparent element:', grandparent);
                console.log('Grandparent class:', grandparent.className);
                console.log('Grandparent display:', getComputedStyle(grandparent).display);
                console.log('Grandparent visibility:', getComputedStyle(grandparent).visibility);
                console.log('Grandparent opacity:', getComputedStyle(grandparent).opacity);
                console.log('Grandparent width:', grandparent.offsetWidth);
                console.log('Grandparent height:', grandparent.offsetHeight);
            }
        }
    } else {
        console.error('mainImageWrapper not found');
    }
    
    // 检查产品信息区域
    const productInfo = document.querySelector('.product-info');
    if (productInfo) {
        console.log('\n=== Product Info ===');
        console.log('Product info element:', productInfo);
        console.log('Product info display:', getComputedStyle(productInfo).display);
        console.log('Product info visibility:', getComputedStyle(productInfo).visibility);
        console.log('Product info opacity:', getComputedStyle(productInfo).opacity);
        console.log('Product info width:', productInfo.offsetWidth);
        console.log('Product info height:', productInfo.offsetHeight);
    }
    
    // 检查Swiper容器
    const swiperMain = document.querySelector('.swiper-main');
    if (swiperMain) {
        console.log('\n=== Swiper Main ===');
        console.log('Swiper main element:', swiperMain);
        console.log('Swiper main display:', getComputedStyle(swiperMain).display);
        console.log('Swiper main visibility:', getComputedStyle(swiperMain).visibility);
        console.log('Swiper main opacity:', getComputedStyle(swiperMain).opacity);
        console.log('Swiper main width:', swiperMain.offsetWidth);
        console.log('Swiper main height:', swiperMain.offsetHeight);
        console.log('Swiper main overflow:', getComputedStyle(swiperMain).overflow);
    }
    
    // 检查product-grid
    const productGrid = document.querySelector('.product-grid');
    if (productGrid) {
        console.log('\n=== Product Grid ===');
        console.log('Product grid element:', productGrid);
        console.log('Product grid display:', getComputedStyle(productGrid).display);
        console.log('Product grid visibility:', getComputedStyle(productGrid).visibility);
        console.log('Product grid opacity:', getComputedStyle(productGrid).opacity);
        console.log('Product grid width:', productGrid.offsetWidth);
        console.log('Product grid height:', productGrid.offsetHeight);
    }
    
    console.log('=== Debugging complete ===');
}

// 页面加载完成后执行调试
window.addEventListener('load', function() {
    setTimeout(debugCSS, 1000);
});
