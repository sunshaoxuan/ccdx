const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Login page
router.get('/login', (req, res) => {
    res.render('shop/login');
});

// Register page
router.get('/register', (req, res) => {
    res.render('shop/register');
});

// Login action
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user || !(await user.comparePassword(password))) {
            return res.render('shop/login', { error: 'Invalid username or password' });
        }

        if (user.role !== 'admin' && !user.isVerified) {
            return res.render('shop/login', { error: 'Please verify your email before logging in.' });
        }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
        res.cookie('token', token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
        
        req.session.user = { id: user._id, username: user.username, role: user.role };
        
        if (user.role === 'admin') {
            res.redirect('/admin');
        } else {
            res.redirect('/');
        }
    } catch (err) {
        res.render('shop/login', { error: 'An error occurred during login' });
    }
});

// Register action
router.post('/register', async (req, res) => {
    try {
        const { username, password, email, phone } = req.body;
        const existingUser = await User.findOne({ 
            $or: [{ username }, { email }] 
        });
        
        if (existingUser) {
            return res.render('shop/register', { 
                error: existingUser.username === username ? 'Username already exists' : 'Email already registered' 
            });
        }

        const verificationToken = jwt.sign({ email }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
        const user = new User({ 
            username, 
            password, 
            email, 
            phone,
            verificationToken,
            isVerified: false 
        });
        await user.save();
        
        // 模拟发送邮件
        console.log(`Verification Email sent to ${email}. Token: ${verificationToken}`);
        
        res.render('shop/login', { 
            success: 'Registration successful! Please check your email to activate your account. (For testing, you can click the link in server logs)' 
        });
    } catch (err) {
        res.render('shop/register', { error: 'An error occurred during registration' });
    }
});

// Verify Email
router.get('/verify-email/:token', async (req, res) => {
    try {
        const { token } = req.params;
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        const user = await User.findOne({ email: decoded.email, verificationToken: token });
        
        if (!user) {
            return res.render('shop/login', { error: 'Invalid or expired verification link' });
        }
        
        user.isVerified = true;
        user.verificationToken = undefined;
        await user.save();
        
        res.render('shop/login', { success: 'Account verified successfully! You can now login.' });
    } catch (err) {
        res.render('shop/login', { error: 'Invalid or expired verification link' });
    }
});

// Logout
router.get('/logout', (req, res) => {
    res.clearCookie('token');
    req.session.destroy();
    res.redirect('/');
});

module.exports = router;
