const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');
require('dotenv').config();

async function seed() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ccdx');
        console.log('Connected to MongoDB for seeding...');

        // 1. 重置 Admin 账户
        console.log('Resetting Admin account...');
        await User.deleteMany({ username: 'admin' });
        
        // 注意：User 模型有 pre('save') 钩子会自动哈希密码
        // 所以这里直接传入明文 'admin123'
        const admin = new User({
            username: 'admin',
            password: 'admin123',
            role: 'admin',
            email: 'admin@ccdx.com'
        });
        await admin.save();
        console.log('Admin user created/reset with password: admin123');

        // 2. 更新产品数据（保持之前的主料图标和配料表配置）
        const initialProducts = [
            {
                name: { zh: '时令鲜虾水饺', jp: '季節の海老水餃子' },
                description: { zh: '严选大颗鲜虾，搭配清爽时蔬', jp: '厳選された大きな海老と新鮮な野菜' },
                spec: { zh: '1kg', jp: '1kg' },
                price: 3300,
                imageUrl: '/assets/shrimp-jiaozi.png',
                category: 'jiaozi',
                ingredients: {
                    zh: '面粉、鲜虾、猪肉、韭菜、生姜、食用盐、芝麻油',
                    jp: '小麦粉、海老、豚肉、ニラ、生姜、食塩、ごま油'
                },
                mainIngredients: [
                    { name: { zh: '鲜虾', jp: '海老' }, iconUrl: '/assets/icon-shrimp.png' },
                    { name: { zh: '猪肉', jp: '豚肉' }, iconUrl: '/assets/icon-pork.png' }
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
                    { name: { zh: '猪肉', jp: '豚肉' }, iconUrl: '/assets/icon-pork.png' },
                    { name: { zh: '白菜', jp: '白菜' }, iconUrl: '/assets/icon-cabbage.png' }
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
                    zh: '面粉、韭菜、鸡蛋、虾皮、食用盐、芝麻油',
                    jp: '小麦粉、ニラ、卵、干し海老、食塩、ごま油'
                },
                mainIngredients: [
                    { name: { zh: '韭菜', jp: 'ニラ' }, iconUrl: '/assets/icon-chives.png' },
                    { name: { zh: '鸡蛋', jp: '卵' }, iconUrl: '/assets/icon-egg.png' }
                ]
            },
            {
                name: { zh: '鲜美扇贝韭菜水饺', jp: 'ホタテニラ餃子' },
                description: { zh: '严选鲜甜扇贝，搭配鲜香韭菜', jp: '厳選された甘いホタテと香り高いニラ' },
                spec: { zh: '1kg', jp: '1kg' },
                price: 3500,
                imageUrl: '/assets/scallop-chive-jiaozi.png',
                category: 'jiaozi',
                ingredients: {
                    zh: '面粉、扇贝、猪肉、韭菜、生姜、食用盐、芝麻油',
                    jp: '小麦粉、ホタテ、豚肉、ニラ、生姜、食塩、ごま油'
                },
                mainIngredients: [
                    { name: { zh: '扇贝', jp: 'ホタテ' }, iconUrl: '/assets/icon-scallop.png' },
                    { name: { zh: '韭菜', jp: 'ニラ' }, iconUrl: '/assets/icon-chives.png' }
                ]
            },
            {
                name: { zh: '饺子全集', jp: '餃子コレクション' },
                description: { zh: '一次品尝多种口味的完美选择', jp: '様々な味を一度に楽しめる完璧な選択' },
                spec: { zh: '1.5kg', jp: '1.5kg' },
                price: 4500,
                imageUrl: '/assets/jiaozi-collection.png',
                category: 'jiaozi',
                ingredients: {
                    zh: '包含鲜虾、猪肉、白菜、韭菜、鸡蛋等多种口味组合',
                    jp: '海老、豚肉、白菜、ニラ、卵など、様々な味の詰め合わせ'
                },
                mainIngredients: [
                    { name: { zh: '鲜虾', jp: '海老' }, iconUrl: '/assets/icon-shrimp.png' },
                    { name: { zh: '猪肉', jp: '豚肉' }, iconUrl: '/assets/icon-pork.png' },
                    { name: { zh: '白菜', jp: '白菜' }, iconUrl: '/assets/icon-cabbage.png' }
                ]
            },
            {
                name: { zh: '故事系列水饺', jp: 'ストーリー餃子' },
                description: { zh: '承载品牌故事的经典之作', jp: 'ブランドストーリーを込めた定番の逸品' },
                spec: { zh: '1kg', jp: '1kg' },
                price: 3200,
                imageUrl: '/assets/story-jiaozi.png',
                category: 'jiaozi',
                ingredients: {
                    zh: '面粉、优质猪肉、时令蔬菜、特制调料',
                    jp: '小麦粉、厳選豚肉、旬の野菜、特製調味料'
                },
                mainIngredients: [
                    { name: { zh: '猪肉', jp: '豚肉' }, iconUrl: '/assets/icon-pork.png' }
                ]
            }
        ];

        await Product.deleteMany({});
        await Product.insertMany(initialProducts);
        console.log('All products seeded successfully.');

        console.log('Seeding completed');
        process.exit(0);
    } catch (err) {
        console.error('Seeding failed:', err);
        process.exit(1);
    }
}

seed();
