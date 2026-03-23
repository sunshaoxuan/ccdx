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

// Profile page
router.get('/profile', authMiddleware, async (req, res) => {
    res.render('shop/profile', { user: req.user });
});

// Update profile action
router.post('/profile', authMiddleware, async (req, res) => {
    try {
        const { realName, phone, address, email } = req.body;
        await User.findByIdAndUpdate(req.user._id, { realName, phone, address, email });
        res.redirect('/profile?success=1');
    } catch (err) {
        res.status(500).render('error', { message: 'Error updating profile' });
    }
});

// Place order
router.post('/place-order', authMiddleware, async (req, res) => {
    try {
        const { items, totalAmount } = req.body;
        
        // 获取当前用户的最新配送信息
        const user = await User.findById(req.user._id);
        if (!user.realName || !user.phone || !user.address) {
            return res.status(400).json({ success: false, message: 'Please complete your profile (Name, Phone, Address) before ordering.' });
        }

        const order = new Order({
            userId: req.user._id,
            items: items,
            totalAmount: totalAmount,
            deliveryInfo: {
                realName: user.realName,
                phone: user.phone,
                address: user.address,
                email: user.email
            },
            status: 'pending'
        });
        await order.save();
        res.json({ success: true, orderId: order._id });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error placing order' });
    }
});

module.exports = router;
