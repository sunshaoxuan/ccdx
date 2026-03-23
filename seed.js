const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function seed() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ccdx');
        console.log('Connected to MongoDB for seeding...');

        // Create Admin with password admin123
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await User.deleteMany({ role: 'admin' });
        const admin = new User({
            username: process.env.ADMIN_USERNAME || 'admin',
            password: hashedPassword,
            role: 'admin',
            email: 'admin@ccdx.com'
        });
        await admin.save();
        console.log('Admin user updated with password: admin123');

        // Create initial products with ingredients and main ingredients
        const initialProducts = [
            {
                name: { zh: '时令鲜虾水饺', jp: '季節の海老水餃子' },
                description: { zh: '严选大颗鲜虾，搭配清爽时蔬', jp: '厳選された大きな海老と新鮮な野菜' },
                spec: { zh: '1kg', jp: '1kg' },
                price: 3300,
                imageUrl: '/assets/shrimp-jiaozi.png',
                category: 'jiaozi',
                ingredients: {
                    zh: '面粉、鲜虾、猪肉、韭菜、生姜、食用盐、芝麻油（不含葱蒜）',
                    jp: '小麦粉、海老、豚肉、ニラ、生姜、食塩、ごま油（ねぎ・にんにく不使用）'
                },
                mainIngredients: [
                    { name: 'shrimp', iconUrl: '/assets/icon-shrimp.png' },
                    { name: 'pork', iconUrl: '/assets/icon-pork.png' }
                ]
            },
            {
                name: { zh: '经典猪肉白菜水饺', jp: '定番豚肉白菜餃子' },
                description: { zh: '传统配方，肉质鲜嫩多汁', jp: '伝統的なレシピ、ジューシーな豚肉' },
                spec: { zh: '1kg', jp: '1kg' },
                price: 2800,
                imageUrl: '/assets/pork-cabbage-jiaozi.png',
                category: 'jiaozi',
                ingredients: {
                    zh: '面粉、猪肉、白菜、大葱、生姜、大蒜、酱油、食用盐',
                    jp: '小麦粉、豚肉、白菜、白ねぎ、生姜、にんにく、醤油、食塩'
                },
                mainIngredients: [
                    { name: 'pork', iconUrl: '/assets/icon-pork.png' }
                ]
            },
            {
                name: { zh: '经典鸡蛋韭菜水饺', jp: '定番ニラ玉餃子' },
                description: { zh: '鲜香韭菜，滑嫩鸡蛋', jp: '香り高いニラとふわふわの卵' },
                spec: { zh: '1kg', jp: '1kg' },
                price: 2500,
                imageUrl: '/assets/egg-chive-jiaozi.png',
                category: 'jiaozi',
                ingredients: {
                    zh: '面粉、韭菜、鸡蛋、虾皮、食用盐、芝麻油（不含肉类、葱蒜）',
                    jp: '小麦粉、ニラ、卵、干し海老、食塩、ごま油（肉類・ねぎ・にんにく不使用）'
                }
            }
        ];

        await Product.deleteMany({});
        await Product.insertMany(initialProducts);
        console.log('Initial products seeded with ingredients and icons');

        console.log('Seeding completed');
        process.exit(0);
    } catch (err) {
        console.error('Seeding failed:', err);
        process.exit(1);
    }
}

seed();
