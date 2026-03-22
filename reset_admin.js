const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function resetAdmin() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ccdx');
        console.log('Connected to MongoDB...');

        // 强制删除现有 admin
        await User.deleteOne({ username: 'admin' });
        console.log('Old admin deleted');

        // 创建新 admin
        const admin = new User({
            username: 'admin',
            password: 'admin_password_change_me', // 明确使用 .env 中的这个值
            role: 'admin',
            email: 'admin@ccdx.com'
        });
        await admin.save();
        console.log('New admin created with password: admin_password_change_me');

        process.exit(0);
    } catch (err) {
        console.error('Reset failed:', err);
        process.exit(1);
    }
}

resetAdmin();
