const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).redirect('/login');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).redirect('/login');
        }

        req.user = user;
        req.session.user = {
            id: user._id,
            username: user.username,
            role: user.role
        };
        res.locals.user = req.session.user;
        next();
    } catch (err) {
        res.status(401).redirect('/login');
    }
};

const adminMiddleware = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).render('error', { message: 'Access denied. Admin only.' });
    }
};

module.exports = { authMiddleware, adminMiddleware };
