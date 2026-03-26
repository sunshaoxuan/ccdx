const jwt = require('jsonwebtoken');
const User = require('../models/User');

const hydrateSessionUser = (user) => ({
    id: user._id,
    username: user.username,
    role: user.role
});

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
        req.session.user = hydrateSessionUser(user);
        res.locals.user = req.session.user;
        next();
    } catch (err) {
        res.status(401).redirect('/login');
    }
};

const optionalAuthMiddleware = async (req, res, next) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
        const sessionUserId = req.session?.user?.id;

        if (!token && !sessionUserId) {
            return next();
        }

        let userId = sessionUserId;
        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
            userId = decoded.id;
        }

        if (!userId) {
            return next();
        }

        const user = await User.findById(userId);
        if (!user) {
            return next();
        }

        req.user = user;
        req.session.user = hydrateSessionUser(user);
        res.locals.user = req.session.user;
        next();
    } catch (err) {
        next();
    }
};

const adminMiddleware = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).render('error', { message: 'Access denied. Admin only.' });
    }
};

module.exports = { authMiddleware, adminMiddleware, optionalAuthMiddleware };
