/* ============================================
   道韵五行 - DAO Essence & Five Elements
   主要 JavaScript 功能
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {
    initNavigation();
    initScrollAnimations();
    initHeaderScroll();
    initSmoothScroll();
    initFiveElementsInteraction();
    initMysticEffects();
    updateCartBadge(); // 更新购物车徽章
});

/* ============================================
   统一购物车系统 - 购物车徽章更新
   ============================================ */
function updateCartBadge() {
    const cartData = localStorage.getItem('daoessence_cart');
    const badge = document.getElementById('cartBadge');
    const floatingBadge = document.getElementById('floatingCartBadge');

    // Update nav badge
    if (badge) {
        if (cartData) {
            try {
                const data = JSON.parse(cartData);
                const items = Array.isArray(data) ? data : (data.items || []);
                const count = items.reduce((sum, item) => sum + item.quantity, 0);
                badge.textContent = count;
                badge.style.display = count > 0 ? 'flex' : 'none';
            } catch (e) {
                badge.style.display = 'none';
            }
        } else {
            badge.style.display = 'none';
        }
    }

    // Update floating badge
    if (floatingBadge) {
        if (cartData) {
            try {
                const data = JSON.parse(cartData);
                const items = Array.isArray(data) ? data : (data.items || []);
                const count = items.reduce((sum, item) => sum + item.quantity, 0);
                floatingBadge.textContent = count;
                floatingBadge.style.display = count > 0 ? 'flex' : 'none';
            } catch (e) {
                floatingBadge.style.display = 'none';
            }
        } else {
            floatingBadge.style.display = 'none';
        }
    }
}

// 监听 storage 变化(跨页面同步)
window.addEventListener('storage', function(e) {
    if (e.key === 'daoessence_cart') {
        updateCartBadge();
    }
});

// 购物车模态框功能
function toggleCart() {
    // 如果当前页面是shop.html，直接调用现有的toggleCart
    if (window.location.pathname.includes('shop.html')) {
        if (typeof window.toggleCart === 'function') {
            window.toggleCart();
        }
        return;
    }
    
    // 对于其他页面，重定向到shop.html
    window.location.href = 'shop.html';
}

/* ============================================
   导航功能 - Navigation
   ============================================ */

function initNavigation() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            this.classList.toggle('active');
            
            const spans = this.querySelectorAll('span');
            if (this.classList.contains('active')) {
                spans[0].style.transform = 'rotate(45deg) translate(8px, 8px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(8px, -8px)';
            } else {
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });
        
        // 点击外部关闭菜单
        document.addEventListener('click', function(e) {
            if (!navMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                navMenu.classList.remove('active');
                mobileMenuBtn.classList.remove('active');
                const spans = mobileMenuBtn.querySelectorAll('span');
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });
    }
}

/* ============================================
   头部滚动效果 - Header Scroll
   ============================================ */

function initHeaderScroll() {
    const header = document.querySelector('.header');
    
    if (header) {
        // 非首页：header 初始带有 scrolled class，始终保持有背景状态
        const isHomePage = document.body.classList.contains('home-page') 
            || window.location.pathname.endsWith('index.html') 
            || window.location.pathname === '/'
            || window.location.pathname.endsWith('/');
        
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                // 只有首页才在顶部时移除 scrolled（透明导航效果）
                if (isHomePage) {
                    header.classList.remove('scrolled');
                }
            }
        });
    }
}

/* ============================================
   滚动动画 - Scroll Animations
   ============================================ */

function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.scroll-animate');
    
    if (animatedElements.length === 0) return;
    
    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, index * 100);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    animatedElements.forEach(el => observer.observe(el));
}

/* ============================================
   平滑滚动 - Smooth Scroll
   ============================================ */

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
}

/* ============================================
   五行交互 - Five Elements Interaction
   ============================================ */

function initFiveElementsInteraction() {
    const elementCards = document.querySelectorAll('.element-card');
    
    elementCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            const element = this.dataset.element;
            highlightRelatedElements(element);
        });
        
        card.addEventListener('mouseleave', function() {
            resetElementHighlights();
        });
    });
}

// 五行相生相克关系
const fiveElementsRelations = {
    wood: {
        generates: 'fire',
        overcomes: 'earth',
        generatedBy: 'water',
        overcomeBy: 'metal',
        color: '#2D5A3D',
        name: 'Wood',
        traits: ['Growth', 'Creation', 'Benevolence']
    },
    fire: {
        generates: 'earth',
        overcomes: 'metal',
        generatedBy: 'wood',
        overcomeBy: 'water',
        color: '#8B2500',
        name: 'Fire',
        traits: ['Passion', 'Light', 'Etiquette']
    },
    earth: {
        generates: 'metal',
        overcomes: 'water',
        generatedBy: 'fire',
        overcomeBy: 'wood',
        color: '#8B7355',
        name: 'Earth',
        traits: ['Stability', 'Inclusiveness', 'Integrity']
    },
    metal: {
        generates: 'water',
        overcomes: 'wood',
        generatedBy: 'earth',
        overcomeBy: 'fire',
        color: '#C0C0C0',
        name: 'Metal',
        traits: ['Restraint', 'Justice', 'Righteousness']
    },
    water: {
        generates: 'wood',
        overcomes: 'fire',
        generatedBy: 'metal',
        overcomeBy: 'earth',
        color: '#1A3A4A',
        name: 'Water',
        traits: ['Wisdom', 'Flow', 'Adaptability']
    }
};

function highlightRelatedElements(element) {
    const relations = fiveElementsRelations[element];
    if (!relations) return;
    
    document.querySelectorAll('.element-card').forEach(card => {
        const cardElement = card.dataset.element;
        card.classList.remove('highlight-generate', 'highlight-overcome');
        
        if (cardElement === relations.generates) {
            card.classList.add('highlight-generate');
        } else if (cardElement === relations.overcomes) {
            card.classList.add('highlight-overcome');
        }
    });
}

function resetElementHighlights() {
    document.querySelectorAll('.element-card').forEach(card => {
        card.classList.remove('highlight-generate', 'highlight-overcome');
    });
}

/* ============================================
   神秘效果 - Mystic Effects
   ============================================ */

function initMysticEffects() {
    // 鼠标跟随光效
    const glowElements = document.querySelectorAll('.mystic-glow');
    
    glowElements.forEach(el => {
        el.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            this.style.setProperty('--glow-x', `${x}px`);
            this.style.setProperty('--glow-y', `${y}px`);
        });
    });
    
    // Energy symbol glow effect
    const energySymbols = document.querySelectorAll('.energy-symbol');
    energySymbols.forEach(symbol => {
        setInterval(() => {
            symbol.style.opacity = Math.random() * 0.3 + 0.7;
        }, 2000 + Math.random() * 3000);
    });
}

/* ============================================
   产品筛选 - Product Filter
   ============================================ */

function initProductFilter() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const products = document.querySelectorAll('[data-element]');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const filter = this.dataset.filter;
            
            products.forEach(product => {
                if (filter === 'all' || product.dataset.element === filter) {
                    product.style.display = 'block';
                    setTimeout(() => {
                        product.style.opacity = '1';
                        product.style.transform = 'scale(1)';
                    }, 50);
                } else {
                    product.style.opacity = '0';
                    product.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        product.style.display = 'none';
                    }, 300);
                }
            });
        });
    });
}

/* ============================================
   咨询预约 - Consultation Booking
   ============================================ */

function openBookingModal(masterName, specialty) {
    const modal = document.createElement('div');
    modal.className = 'booking-modal';
    modal.innerHTML = `
        <div class="modal-overlay" onclick="closeBookingModal()"></div>
        <div class="modal-content">
            <button class="modal-close" onclick="closeBookingModal()">✕</button>
            <h3>Book Consultation - ${masterName}</h3>
            <p class="specialty">Specialty: ${specialty}</p>
            <form class="booking-form" onsubmit="submitBooking(event)">
                <div class="form-group">
                    <label>Name</label>
                    <input type="text" required placeholder="Your Name">
                </div>
                <div class="form-group">
                    <label>Birth Information</label>
                    <input type="text" placeholder="Lunar Year/Month/Day/Hour (Optional)">
                </div>
                <div class="form-group">
                    <label>Questions</label>
                    <textarea required placeholder="Please describe your questions..."></textarea>
                </div>
                <div class="form-group">
                    <label>Contact</label>
                    <input type="email" required placeholder="Your Email">
                </div>
                <button type="submit" class="btn btn-primary">Submit Booking</button>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    
    setTimeout(() => modal.classList.add('active'), 10);
}

function closeBookingModal() {
    const modal = document.querySelector('.booking-modal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.remove();
            document.body.style.overflow = 'auto';
        }, 300);
    }
}

function submitBooking(e) {
    e.preventDefault();
    showNotification('Booking submitted successfully! We will contact you within 24 hours.', 'success');
    closeBookingModal();
}

/* ============================================
   通知系统 - Notification System
   ============================================ */

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span class="notification-icon">${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span>
        <span>${message}</span>
        <button class="notification-close" onclick="this.parentElement.remove()">✕</button>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#2D5A3D' : type === 'error' ? '#8B2500' : '#1A3A4A'};
        color: #F5F0E6;
        padding: 15px 25px;
        border-radius: 4px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        gap: 15px;
        z-index: 10000;
        animation: slideInRight 0.3s ease-out;
        border-left: 3px solid #D4AF37;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

/* ============================================
   工具函数 - Utility Functions
   ============================================ */

// 格式化价格
function formatPrice(price, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
    }).format(price);
}

// 防抖函数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 节流函数
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// 导出全局函数
window.DAOEssence = {
    showNotification,
    openBookingModal,
    closeBookingModal,
    fiveElementsRelations,
    formatPrice
};

/* ============================================
   通知动画样式
   ============================================ */

const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100px);
        }
    }
    
    .notification-close {
        background: none;
        border: none;
        color: #F5F0E6;
        font-size: 18px;
        cursor: pointer;
        padding: 0;
        line-height: 1;
    }
    
    .booking-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 2000;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.3s ease;
    }
    
    .booking-modal.active {
        opacity: 1;
    }
    
    .booking-modal .modal-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(26, 22, 18, 0.8);
    }
    
    .booking-modal .modal-content {
        background: #F5F0E6;
        border-radius: 8px;
        padding: 40px;
        max-width: 500px;
        width: 90%;
        position: relative;
        border: 2px solid #D4AF37;
        transform: translateY(20px);
        transition: transform 0.3s ease;
    }
    
    .booking-modal.active .modal-content {
        transform: translateY(0);
    }
    
    .booking-modal .modal-close {
        position: absolute;
        top: 15px;
        right: 15px;
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #5A5040;
    }
    
    .booking-form .form-group {
        margin-bottom: 20px;
    }
    
    .booking-form label {
        display: block;
        margin-bottom: 8px;
        font-weight: 500;
        color: #2C2416;
    }
    
    .booking-form input,
    .booking-form textarea {
        width: 100%;
        padding: 12px;
        border: 1px solid #D4AF37;
        border-radius: 4px;
        background: #F8F4ED;
        font-family: inherit;
    }
    
    .booking-form input:focus,
    .booking-form textarea:focus {
        outline: none;
        border-color: #8B2500;
    }
`;
document.head.appendChild(notificationStyles);