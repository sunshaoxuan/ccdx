const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Order = require('../models/Order');
const { authMiddleware } = require('../middlewares/auth');

// Shop routes
router.get('/about', (req, res) => {
    res.render('shop/about');
});

router.get('/info', (req, res) => {
    res.render('shop/info');
});

// Home page
router.get('/', async (req, res) => {
    try {
        const products = await Product.find({ isActive: true }).limit(3);
        res.render('shop/index', { products });
    } catch (err) {
        res.status(500).render('error', { message: 'Error loading home page' });
    }
});

// Menu page
router.get('/menu', async (req, res) => {
    try {
        const products = await Product.find({ isActive: true });
        res.render('shop/menu', { products });
    } catch (err) {
        res.status(500).render('error', { message: 'Error loading menu' });
    }
});

// Cart page
router.get('/cart', (req, res) => {
    res.render('shop/cart');
});

// Order history
router.get('/orders', async (req, res) => {
    try {
        let orders = [];
        if (req.user) {
            orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
        } else {
            // 如果是游客，尝试从 session 中获取最近的订单 ID（简单实现）
            const lastOrderId = req.session.lastOrderId;
            if (lastOrderId) {
                orders = await Order.find({ _id: lastOrderId }).sort({ createdAt: -1 });
            }
        }
        res.render('shop/orders', { orders });
    } catch (err) {
        res.status(500).render('error', { message: 'Error loading orders' });
    }
});

// Profile page
router.get('/profile', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.render('shop/profile', { user });
    } catch (err) {
        res.status(500).render('error', { message: 'Error loading profile' });
    }
});

// Update profile action
router.post('/profile', authMiddleware, async (req, res) => {
    try {
        const { phone, email } = req.body;
        await User.findByIdAndUpdate(req.user._id, { phone, email });
        res.redirect('/profile?success=1');
    } catch (err) {
        res.status(500).render('error', { message: 'Error updating profile' });
    }
});

// Add address
router.post('/profile/address/add', authMiddleware, async (req, res) => {
    try {
        const { realName, phone, postalCode, prefecture, city, addressLine1, addressLine2, isDefault } = req.body;
        const user = await User.findById(req.user._id);
        
        if (isDefault) {
            user.addresses.forEach(a => a.isDefault = false);
        }
        
        user.addresses.push({ 
            realName, 
            phone, 
            postalCode,
            prefecture,
            city,
            addressLine1,
            addressLine2,
            isDefault: isDefault === 'on' || user.addresses.length === 0 
        });
        
        await user.save();
        res.redirect('/profile');
    } catch (err) {
        console.error(err);
        res.status(500).render('error', { message: 'Error adding address' });
    }
});

// Update address
router.post('/profile/address/update/:id', authMiddleware, async (req, res) => {
    try {
        const { realName, phone, postalCode, prefecture, city, addressLine1, addressLine2, isDefault } = req.body;
        const user = await User.findById(req.user._id);
        const address = user.addresses.id(req.params.id);
        
        if (address) {
            if (isDefault) {
                user.addresses.forEach(a => a.isDefault = false);
            }
            
            address.realName = realName;
            address.phone = phone;
            address.postalCode = postalCode;
            address.prefecture = prefecture;
            address.city = city;
            address.addressLine1 = addressLine1;
            address.addressLine2 = addressLine2;
            address.isDefault = isDefault === 'on' || (address.isDefault && !isDefault);
            
            await user.save();
        }
        res.redirect('/profile');
    } catch (err) {
        console.error(err);
        res.status(500).render('error', { message: 'Error updating address' });
    }
});

// Delete address
router.post('/profile/address/delete/:id', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const addressIndex = user.addresses.findIndex(a => a._id.toString() === req.params.id);
        
        if (addressIndex > -1) {
            const wasDefault = user.addresses[addressIndex].isDefault;
            user.addresses.splice(addressIndex, 1);
            
            if (wasDefault && user.addresses.length > 0) {
                user.addresses[0].isDefault = true;
            }
            
            await user.save();
        }
        res.redirect('/profile');
    } catch (err) {
        res.status(500).render('error', { message: 'Error deleting address' });
    }
});

// Set default address
router.post('/profile/address/default/:id', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        user.addresses.forEach(a => {
            a.isDefault = a._id.toString() === req.params.id;
        });
        await user.save();
        res.redirect('/profile');
    } catch (err) {
        res.status(500).render('error', { message: 'Error setting default address' });
    }
});

// Place order
router.post('/place-order', async (req, res) => {
    try {
        const { items, totalAmount, deliveryInfo, paymentMethod } = req.body;
        let finalUserId;
        let finalDeliveryInfo = deliveryInfo;

        if (req.user) {
            finalUserId = req.user._id;
            // 如果是已登录用户，且没有传 deliveryInfo（说明是从个人中心默认地址下单）
            if (!finalDeliveryInfo) {
                const user = await User.findById(req.user._id);
                const defaultAddr = user.addresses.find(a => a.isDefault) || user.addresses[0];
                if (!defaultAddr) {
                    return res.status(400).json({ success: false, message: 'Please add a delivery address in your profile first.' });
                }
                finalDeliveryInfo = {
                    realName: defaultAddr.realName,
                    phone: defaultAddr.phone,
                    address: defaultAddr.address,
                    email: user.email
                };
            }
        } else {
            // 游客下单逻辑：自动生成/关联虚拟账户
            const guestEmail = deliveryInfo.email;
            const guestPhone = deliveryInfo.phone;
            
            let guestUser = await User.findOne({ 
                $or: [{ email: guestEmail }, { phone: guestPhone }],
                isGuest: true 
            });

            if (!guestUser) {
                guestUser = new User({
                    username: `guest_${Date.now()}`,
                    password: Math.random().toString(36).slice(-8), // 随机密码
                    email: guestEmail,
                    phone: guestPhone,
                    isGuest: true,
                    isVerified: true, // 游客账户默认视为已验证（通过订单联系）
                    addresses: [{
                        realName: deliveryInfo.realName,
                        phone: guestPhone,
                        address: deliveryInfo.address,
                        isDefault: true
                    }]
                });
                await guestUser.save();
            }
            finalUserId = guestUser._id;
        }

        const order = new Order({
            userId: finalUserId,
            items: items,
            totalAmount: totalAmount,
            deliveryInfo: finalDeliveryInfo,
            paymentMethod: paymentMethod || 'cash',
            status: 'pending'
        });
        await order.save();
        
        // 如果是游客，记录最后一次订单 ID
        if (!req.user) {
            req.session.lastOrderId = order._id;
        }

        res.json({ success: true, orderId: order._id });
    } catch (err) {
        console.error('Order error:', err);
        res.status(500).json({ success: false, message: 'Error placing order' });
    }
});

module.exports = router;
