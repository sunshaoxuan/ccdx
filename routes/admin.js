const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { authMiddleware, adminMiddleware } = require('../middlewares/auth');

// Multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Admin dashboard
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const productsCount = await Product.countDocuments();
        const ordersCount = await Order.countDocuments();
        res.render('admin/dashboard', { productsCount, ordersCount });
    } catch (err) {
        res.status(500).render('error', { message: 'Error loading dashboard' });
    }
});

// Product list
router.get('/products', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const products = await Product.find();
        res.render('admin/products/index', { products });
    } catch (err) {
        res.status(500).render('error', { message: 'Error loading products' });
    }
});

// Add product page
router.get('/products/add', authMiddleware, adminMiddleware, (req, res) => {
    res.render('admin/products/add');
});

// Add product action
router.post('/products/add', authMiddleware, adminMiddleware, upload.single('image'), async (req, res) => {
    try {
        const { name_zh, name_jp, description_zh, description_jp, price, category } = req.body;
        const product = new Product({
            name: { zh: name_zh, jp: name_jp },
            description: { zh: description_zh, jp: description_jp },
            price: parseFloat(price),
            category: category,
            imageUrl: req.file ? `/uploads/${req.file.filename}` : ''
        });
        await product.save();
        res.redirect('/admin/products');
    } catch (err) {
        res.status(500).render('error', { message: 'Error adding product' });
    }
});

// Edit product page
router.get('/products/edit/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        res.render('admin/products/edit', { product });
    } catch (err) {
        res.status(500).render('error', { message: 'Error loading product edit page' });
    }
});

// Edit product action
router.post('/products/edit/:id', authMiddleware, adminMiddleware, upload.single('image'), async (req, res) => {
    try {
        const { name_zh, name_jp, description_zh, description_jp, price, category } = req.body;
        const updateData = {
            name: { zh: name_zh, jp: name_jp },
            description: { zh: description_zh, jp: description_jp },
            price: parseFloat(price),
            category: category
        };
        if (req.file) {
            updateData.imageUrl = `/uploads/${req.file.filename}`;
        }
        await Product.findByIdAndUpdate(req.params.id, updateData);
        res.redirect('/admin/products');
    } catch (err) {
        res.status(500).render('error', { message: 'Error updating product' });
    }
});

// Delete product
router.post('/products/delete/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.redirect('/admin/products');
    } catch (err) {
        res.status(500).render('error', { message: 'Error deleting product' });
    }
});

module.exports = router;
