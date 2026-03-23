const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');
require('dotenv').config();

async function seed() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ccdx');
        console.log('Connected to MongoDB for seeding...');

        // Create Admin
        const adminExists = await User.findOne({ role: 'admin' });
        if (!adminExists) {
            const admin = new User({
                username: process.env.ADMIN_USERNAME || 'admin',
                password: process.env.ADMIN_PASSWORD || 'admin123',
                role: 'admin',
                email: 'admin@ccdx.com'
            });
            await admin.save();
            console.log('Admin user created');
        }

        // Create initial products
        const initialProducts = [
            {
                name: { zh: '时令鲜虾水饺', jp: '季節の海老水餃子' },
                description: { zh: '严选大颗鲜虾，搭配清爽时蔬', jp: '厳選された大きな海老と新鮮な野菜' },
                spec: { zh: '1kg', jp: '1kg' },
                price: 3300,
                imageUrl: '/assets/shrimp-jiaozi.png',
                category: 'jiaozi'
            },
            {
                name: { zh: '经典猪肉白菜水饺', jp: '定番豚肉白菜餃子' },
                description: { zh: '传统配方，肉质鲜嫩多汁', jp: '伝統的なレシピ、ジューシーな豚肉' },
                spec: { zh: '1kg', jp: '1kg' },
                price: 2800,
                imageUrl: '/assets/pork-cabbage-jiaozi.png',
                category: 'jiaozi'
            },
            {
                name: { zh: '经典鸡蛋韭菜水饺', jp: '定番ニラ玉餃子' },
                description: { zh: '鲜香韭菜，滑嫩鸡蛋', jp: '香り高いニラとふわふわの卵' },
                spec: { zh: '1kg', jp: '1kg' },
                price: 2500,
                imageUrl: '/assets/egg-chive-jiaozi.png',
                category: 'jiaozi'
            },
            {
                name: { zh: '黑猪肉香菇水饺', jp: '黒豚椎茸餃子' },
                description: { zh: '严选黑猪肉，搭配香浓香菇', jp: '厳選された黒豚と香り高い椎茸' },
                spec: { zh: '1kg', jp: '1kg' },
                price: 3500,
                imageUrl: '/assets/pork-mushroom-jiaozi.png',
                category: 'jiaozi'
            },
            {
                name: { zh: '牛肉大葱水饺', jp: '牛肉ネギ餃子' },
                description: { zh: '鲜嫩牛肉，大葱提鲜', jp: '新鮮な牛肉とネギの旨味' },
                spec: { zh: '1kg', jp: '1kg' },
                price: 3800,
                imageUrl: '/assets/beef-onion-jiaozi.png',
                category: 'jiaozi'
            },
            {
                name: { zh: '三鲜水饺', jp: '三鮮餃子' },
                description: { zh: '虾仁、猪肉、鸡蛋的完美结合', jp: '海老、豚肉、卵の完璧な組み合わせ' },
                spec: { zh: '1kg', jp: '1kg' },
                price: 3200,
                imageUrl: '/assets/sanxian-jiaozi.png',
                category: 'jiaozi'
            }
        ];

        await Product.deleteMany({});
        await Product.insertMany(initialProducts);
        console.log('Initial products seeded with 6 items');

        console.log('Seeding completed');
        process.exit(0);
    } catch (err) {
        console.error('Seeding failed:', err);
        process.exit(1);
    }
}

seed();
