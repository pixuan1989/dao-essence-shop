/* ============================================
   Stripe Payment Integration - Backend Server
   DAO Essence Shop
   ============================================ */

require('dotenv').config();
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cors = require('cors');

const app = express();

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'file://'],
    methods: ['GET', 'POST'],
    credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Stripe server is running' });
});

// Create Payment Intent
app.post('/api/create-payment-intent', async (req, res) => {
    try {
        const { amount, currency = 'usd', metadata = {} } = req.body;

        console.log('Creating Payment Intent:', { amount, currency, metadata });

        // Validate amount
        if (!amount || amount <= 0) {
            return res.status(400).json({
                error: 'Invalid amount. Must be greater than 0.'
            });
        }

        // Create Payment Intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Convert to cents
            currency: currency.toLowerCase(),
            metadata: {
                ...metadata,
                shop: 'dao-essence',
                timestamp: new Date().toISOString()
            },
            automatic_payment_methods: {
                enabled: true
            },
            description: 'DAO Essence Shop Order'
        });

        console.log('Payment Intent created:', paymentIntent.id);

        res.json({
            success: true,
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
            amount: paymentIntent.amount
        });

    } catch (error) {
        console.error('Error creating Payment Intent:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get Payment Intent Status
app.get('/api/payment-intent/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const paymentIntent = await stripe.paymentIntents.retrieve(id);

        res.json({
            success: true,
            status: paymentIntent.status,
            paymentIntent: paymentIntent
        });

    } catch (error) {
        console.error('Error retrieving Payment Intent:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Webhook endpoint for payment status updates
app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            console.log('Payment succeeded:', paymentIntent.id);
            // Here you can: update database, send email, etc.
            break;

        case 'payment_intent.payment_failed':
            const failedPayment = event.data.object;
            console.log('Payment failed:', failedPayment.id);
            // Handle failed payment
            break;

        case 'payment_intent.created':
            console.log('Payment Intent created:', event.data.object.id);
            break;

        default:
            console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log('========================================');
    console.log('Stripe Payment Server Running');
    console.log('========================================');
    console.log(`Server URL: http://localhost:${PORT}`);
    console.log(`Health Check: http://localhost:${PORT}/api/health`);
    console.log(`Payment Intent API: http://localhost:${PORT}/api/create-payment-intent`);
    console.log('========================================');
    console.log('Environment:', process.env.NODE_ENV || 'development');
    console.log('========================================');
});
