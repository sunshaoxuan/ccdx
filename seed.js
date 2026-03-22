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

        // Create initial products if none exist
        const productCount = await Product.countDocuments();
        if (productCount === 0) {
            const initialProducts = [
                {
                    name: { zh: '时令鲜虾水饺', jp: '季節の海老水餃子' },
                    description: { zh: '严选大颗鲜虾，搭配清爽时蔬', jp: '厳選された大きな海老と新鮮な野菜' },
                    price: 58,
                    imageUrl: '/assets/shrimp-jiaozi.png',
                    category: 'jiaozi'
                },
                {
                    name: { zh: '经典猪肉白菜水饺', jp: '定番豚肉白菜餃子' },
                    description: { zh: '传统配方，肉质鲜嫩多汁', jp: '伝統的なレシピ、ジューシーな豚肉' },
                    price: 48,
                    imageUrl: '/assets/pork-cabbage-jiaozi.png',
                    category: 'jiaozi'
                },
                {
                    name: { zh: '经典鸡蛋韭菜水饺', jp: '定番ニラ玉餃子' },
                    description: { zh: '鲜香韭菜，滑嫩鸡蛋', jp: '香り高いニラとふわふわの卵' },
                    price: 45,
                    imageUrl: '/assets/egg-chive-jiaozi.png',
                    category: 'jiaozi'
                }
            ];
            await Product.insertMany(initialProducts);
            console.log('Initial products seeded');
        }

        console.log('Seeding completed');
        process.exit(0);
    } catch (err) {
        console.error('Seeding failed:', err);
        process.exit(1);
    }
}

seed();
