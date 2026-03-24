const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'customer'], default: 'customer' },
    email: { type: String },
    realName: { type: String },
    phone: { type: String },
    addresses: [{
        realName: String,
        phone: String,
        postalCode: String,
        prefecture: String,
        city: String,
        addressLine1: String, // 丁目・番地・号
        addressLine2: String, // 建物名・部屋番号
        isDefault: { type: Boolean, default: false }
    }],
    isVerified: { type: Boolean, default: false },
    verificationToken: String,
    isGuest: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
