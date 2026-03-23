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
    const availableIcons = [
        { key: 'shrimp', zh: '鲜虾', jp: '海老' },
        { key: 'pork', zh: '猪肉', jp: '豚肉' },
        { key: 'cabbage', zh: '白菜', jp: '白菜' },
        { key: 'chives', zh: '韭菜', jp: 'ニラ' },
        { key: 'egg', zh: '鸡蛋', jp: '卵' },
        { key: 'scallop', zh: '扇贝', jp: 'ホタテ' }
    ];
    res.render('admin/products/add', { availableIcons });
});

// Add product action
router.post('/products/add', authMiddleware, adminMiddleware, upload.single('image'), async (req, res) => {
    try {
        const { name_zh, name_jp, description_zh, description_jp, price, category, spec_zh, spec_jp, ingredients_zh, ingredients_jp, main_ingredients } = req.body;
        
        // Parse main ingredients
        let mainIngredients = [];
        if (main_ingredients) {
            const ingredientsList = Array.isArray(main_ingredients) ? main_ingredients : [main_ingredients];
            const iconMap = {
                'shrimp': { zh: '鲜虾', jp: '海老', icon: '/assets/icon-shrimp.png' },
                'pork': { zh: '猪肉', jp: '豚肉', icon: '/assets/icon-pork.png' },
                'cabbage': { zh: '白菜', jp: '白菜', icon: '/assets/icon-cabbage.png' },
                'chives': { zh: '韭菜', jp: 'ニラ', icon: '/assets/icon-chives.png' },
                'egg': { zh: '鸡蛋', jp: '卵', icon: '/assets/icon-egg.png' },
                'scallop': { zh: '扇贝', jp: 'ホタテ', icon: '/assets/icon-scallop.png' }
            };
            mainIngredients = ingredientsList.map(key => ({
                name: { zh: iconMap[key].zh, jp: iconMap[key].jp },
                iconUrl: iconMap[key].icon
            }));
        }

        const product = new Product({
            name: { zh: name_zh, jp: name_jp },
            description: { zh: description_zh, jp: description_jp },
            spec: { zh: spec_zh, jp: spec_jp },
            ingredients: { zh: ingredients_zh, jp: ingredients_jp },
            mainIngredients: mainIngredients,
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
        const availableIcons = [
            { key: 'shrimp', zh: '鲜虾', jp: '海老' },
            { key: 'pork', zh: '猪肉', jp: '豚肉' },
            { key: 'cabbage', zh: '白菜', jp: '白菜' },
            { key: 'chives', zh: '韭菜', jp: 'ニラ' },
            { key: 'egg', zh: '鸡蛋', jp: '卵' },
            { key: 'scallop', zh: '扇贝', jp: 'ホタテ' }
        ];
        res.render('admin/products/edit', { product, availableIcons });
    } catch (err) {
        res.status(500).render('error', { message: 'Error loading product edit page' });
    }
});

// Edit product action
router.post('/products/edit/:id', authMiddleware, adminMiddleware, upload.single('image'), async (req, res) => {
    try {
        const { name_zh, name_jp, description_zh, description_jp, price, category, spec_zh, spec_jp, ingredients_zh, ingredients_jp, main_ingredients } = req.body;
        
        // Parse main ingredients
        let mainIngredients = [];
        if (main_ingredients) {
            const ingredientsList = Array.isArray(main_ingredients) ? main_ingredients : [main_ingredients];
            const iconMap = {
                'shrimp': { zh: '鲜虾', jp: '海老', icon: '/assets/icon-shrimp.png' },
                'pork': { zh: '猪肉', jp: '豚肉', icon: '/assets/icon-pork.png' },
                'cabbage': { zh: '白菜', jp: '白菜', icon: '/assets/icon-cabbage.png' },
                'chives': { zh: '韭菜', jp: 'ニラ', icon: '/assets/icon-chives.png' },
                'egg': { zh: '鸡蛋', jp: '卵', icon: '/assets/icon-egg.png' },
                'scallop': { zh: '扇贝', jp: 'ホタテ', icon: '/assets/icon-scallop.png' }
            };
            mainIngredients = ingredientsList.map(key => ({
                name: { zh: iconMap[key].zh, jp: iconMap[key].jp },
                iconUrl: iconMap[key].icon
            }));
        }

        const updateData = {
            name: { zh: name_zh, jp: name_jp },
            description: { zh: description_zh, jp: description_jp },
            spec: { zh: spec_zh, jp: spec_jp },
            ingredients: { zh: ingredients_zh, jp: ingredients_jp },
            mainIngredients: mainIngredients,
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
