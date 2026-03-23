const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Order = require('../models/Order');
const { authMiddleware } = require('../middlewares/auth');

// Shop routes
router.get('/about', (req, res) => {
    res.render('shop/about');
});

router.get('/info', (req, res) => {
    res.render('shop/info');
});

// Home page
router.get('/', async (req, res) => {
    try {
        const products = await Product.find({ isActive: true }).limit(3);
        res.render('shop/index', { products });
    } catch (err) {
        res.status(500).render('error', { message: 'Error loading home page' });
    }
});

// Menu page
router.get('/menu', async (req, res) => {
    try {
        const products = await Product.find({ isActive: true });
        res.render('shop/menu', { products });
    } catch (err) {
        res.status(500).render('error', { message: 'Error loading menu' });
    }
});

// Cart page
router.get('/cart', (req, res) => {
    res.render('shop/cart');
});

// Order history
router.get('/orders', authMiddleware, async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.render('shop/orders', { orders });
    } catch (err) {
        res.status(500).render('error', { message: 'Error loading orders' });
    }
});

// Place order
router.post('/place-order', authMiddleware, async (req, res) => {
    try {
        const { items, totalAmount } = req.body;
        const order = new Order({
            userId: req.user._id,
            items: items,
            totalAmount: totalAmount,
            status: 'pending'
        });
        await order.save();
        res.json({ success: true, orderId: order._id });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error placing order' });
    }
});

module.exports = router;
