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
        const { username, password, email } = req.body;
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.render('shop/register', { error: 'Username already exists' });
        }

        const user = new User({ username, password, email });
        await user.save();
        res.redirect('/login');
    } catch (err) {
        res.render('shop/register', { error: 'An error occurred during registration' });
    }
});

// Logout
router.get('/logout', (req, res) => {
    res.clearCookie('token');
    req.session.destroy();
    res.redirect('/');
});

module.exports = router;
