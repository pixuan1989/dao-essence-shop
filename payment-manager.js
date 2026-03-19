/**
 * DAO Essence - Stripe Payment Integration
 * Handles all payment processing through Snipcart + Stripe
 */

class StripePaymentManager {
    constructor(config = {}) {
        this.config = {
            apiKey: config.apiKey || 'pk_live_YOUR_STRIPE_PUBLIC_KEY', // Replace with actual key
            secretKey: config.secretKey || 'sk_live_YOUR_STRIPE_SECRET_KEY', // For server-side only
            webhookSecret: config.webhookSecret || 'whsec_YOUR_WEBHOOK_SECRET',
            merchantEmail: config.merchantEmail || '18115755283@163.com',
            merchantName: config.merchantName || 'DAO Essence',
            ...config
        };
        
        this.initialized = false;
        this.init();
    }
    
    /**
     * Initialize Stripe
     */
    init() {
        try {
            // Load Stripe.js
            if (!window.Stripe) {
                console.error('❌ Stripe.js not loaded. Make sure to include <script src="https://js.stripe.com/v3/"></script>');
                return;
            }
            
            this.stripe = window.Stripe(this.config.apiKey);
            this.initialized = true;
            
            console.log('✅ Stripe initialized successfully');
            
            // Set up payment event listeners
            this.setupPaymentListeners();
            
        } catch (error) {
            console.error('❌ Error initializing Stripe:', error);
        }
    }
    
    /**
     * Set up payment event listeners
     */
    setupPaymentListeners() {
        // Listen for Snipcart order completion
        if (window.Snipcart) {
            window.Snipcart.subscribe('order:completed', (order) => {
                this.handleOrderCompletion(order);
            });
        }
    }
    
    /**
     * Handle successful payment
     */
    async handleOrderCompletion(order) {
        try {
            console.log('💳 Processing payment for order:', order.invoiceNumber);
            
            // Send order confirmation email
            await this.sendOrderConfirmation(order);
            
            // Update inventory
            await this.updateInventory(order);
            
            // Create fulfillment
            await this.createFulfillment(order);
            
            console.log('✅ Order completed successfully');
            
        } catch (error) {
            console.error('❌ Error handling order completion:', error);
        }
    }
    
    /**
     * Send order confirmation email
     */
    async sendOrderConfirmation(order) {
        try {
            const response = await fetch('/api/send-confirmation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.config.apiKey}`
                },
                body: JSON.stringify({
                    orderId: order.invoiceNumber,
                    customerEmail: order.email,
                    customerName: order.billingAddress.name,
                    items: order.items,
                    total: order.total,
                    currency: order.currency
                })
            });
            
            if (response.ok) {
                console.log('📧 Confirmation email sent');
            }
        } catch (error) {
            console.warn('⚠️ Error sending confirmation email:', error);
        }
    }
    
    /**
     * Update inventory after payment
     */
    async updateInventory(order) {
        try {
            // For each item in order, reduce stock
            for (const item of order.items) {
                const quantity = item.quantity;
                // Update products.json via backend API
                const response = await fetch(`/api/inventory/reduce`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        productId: item.uniqueId,
                        quantity: quantity
                    })
                });
                
                if (response.ok) {
                    console.log(`📦 Inventory updated for ${item.name}`);
                }
            }
        } catch (error) {
            console.warn('⚠️ Error updating inventory:', error);
        }
    }
    
    /**
     * Create fulfillment in ShipStation
     */
    async createFulfillment(order) {
        try {
            const response = await fetch('/api/shipstation/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId: order.invoiceNumber,
                    customerName: order.billingAddress.name,
                    customerEmail: order.email,
                    customerPhone: order.billingAddress.phone,
                    shippingAddress: {
                        name: order.shippingAddress.name,
                        street1: order.shippingAddress.address1,
                        street2: order.shippingAddress.address2,
                        city: order.shippingAddress.city,
                        state: order.shippingAddress.province,
                        postalCode: order.shippingAddress.postalCode,
                        country: order.shippingAddress.country
                    },
                    items: order.items.map(item => ({
                        sku: item.uniqueId,
                        name: item.name,
                        quantity: item.quantity,
                        price: item.price
                    })),
                    total: order.total,
                    currency: order.currency
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('🚚 Fulfillment created in ShipStation:', data.shipmentId);
            }
        } catch (error) {
            console.warn('⚠️ Error creating fulfillment:', error);
        }
    }
    
    /**
     * Get payment status for order
     */
    async getPaymentStatus(orderId) {
        try {
            const response = await fetch(`/api/payment-status/${orderId}`, {
                headers: { 'Authorization': `Bearer ${this.config.apiKey}` }
            });
            
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.error('❌ Error fetching payment status:', error);
        }
    }
    
    /**
     * Process refund
     */
    async processRefund(orderId, amount) {
        try {
            const response = await fetch('/api/refund', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.config.apiKey}`
                },
                body: JSON.stringify({
                    orderId: orderId,
                    amount: amount,
                    reason: 'customer_request'
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('✅ Refund processed:', data.refundId);
                return data;
            }
        } catch (error) {
            console.error('❌ Error processing refund:', error);
        }
    }
    
    /**
     * Get conversion rates (for international currencies)
     */
    async getConversionRate(fromCurrency = 'USD', toCurrency = 'CNY') {
        try {
            const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${fromCurrency}`);
            const data = await response.json();
            return data.rates[toCurrency] || 1;
        } catch (error) {
            console.warn('⚠️ Error fetching conversion rate:', error);
            return 1;
        }
    }
    
    /**
     * Get analytics
     */
    async getAnalytics(startDate, endDate) {
        try {
            const response = await fetch('/api/analytics', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.config.apiKey}`
                },
                body: JSON.stringify({
                    startDate: startDate,
                    endDate: endDate
                })
            });
            
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.error('❌ Error fetching analytics:', error);
        }
    }
}

// Initialize Payment Manager
let paymentManager = null;

document.addEventListener('DOMContentLoaded', () => {
    // 从 window 对象获取公钥（由 Netlify 在构建时注入）
    const publicKey = window.stripeConfig?.publicKey ||
                     window.STRIPE_PUBLIC_KEY ||
                     '';

    if (!publicKey) {
        console.error('❌ Stripe public key not configured');
        return;
    }

    paymentManager = new StripePaymentManager({
        apiKey: publicKey,
        merchantEmail: '18115755283@163.com',
        merchantName: 'DAO Essence'
    });
});

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StripePaymentManager;
}
