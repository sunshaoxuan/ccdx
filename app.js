const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const i18n = require('i18n');
require('dotenv').config();

const { optionalAuthMiddleware } = require('./middlewares/auth');

const app = express();
const DEFAULT_PRODUCT_IMAGE = '/assets/shrimp-jiaozi.png';

function normalizeAssetPath(url, fallback = DEFAULT_PRODUCT_IMAGE) {
    if (!url || typeof url !== 'string') {
        return fallback;
    }

    const normalized = url.trim().replace(/\\/g, '/');
    if (!normalized) {
        return fallback;
    }

    if (/^https?:\/\//i.test(normalized) || normalized.startsWith('data:')) {
        return normalized;
    }

    if (normalized.startsWith('/')) {
        return normalized;
    }

    if (normalized.startsWith('public/')) {
        return '/' + normalized.replace(/^public\//, '');
    }

    if (normalized.startsWith('assets/') || normalized.startsWith('uploads/')) {
        return '/' + normalized;
    }

    const assetMatch = normalized.match(/(?:^|\/)(assets|uploads)\/.+$/);
    if (assetMatch) {
        return '/' + assetMatch[0].replace(/^\/+/, '');
    }

    return fallback;
}

function formatAddress(address = {}) {
    if (!address || typeof address !== 'object') {
        return '';
    }

    if (address.address) {
        return address.address;
    }

    return [
        address.postalCode ? `〒${address.postalCode}` : '',
        address.prefecture,
        address.city,
        address.addressLine1,
        address.addressLine2
    ].filter(Boolean).join(' ');
}

// i18n configuration
i18n.configure({
    locales: ['zh', 'jp'],
    directory: path.join(__dirname, 'locales'),
    defaultLocale: 'zh',
    cookie: 'cc-lang',
    queryParameter: 'lang',
    autoReload: true,
    updateFiles: false,
    syncFiles: true,
    objectNotation: true
});

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ccdx')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB', err));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
    secret: process.env.JWT_SECRET || 'secret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));
app.use(i18n.init);
app.use(optionalAuthMiddleware);

// Static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Global variables for templates
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.lang = req.getLocale();
    res.locals.__ = res.__;
    res.locals.req = req;
    res.locals.assetUrl = normalizeAssetPath;
    res.locals.formatAddress = formatAddress;
    res.locals.defaultProductImage = DEFAULT_PRODUCT_IMAGE;
    next();
});

// Routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use('/', authRoutes);
app.use('/admin', adminRoutes);
app.use('/', shopRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
