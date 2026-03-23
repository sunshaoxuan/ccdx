const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        zh: { type: String, required: true },
        jp: { type: String, required: true }
    },
    description: {
        zh: { type: String },
        jp: { type: String }
    },
    price: { type: Number, required: true },
    spec: {
        zh: { type: String },
        jp: { type: String }
    },
    ingredients: {
        zh: { type: String },
        jp: { type: String }
    },
    mainIngredients: [{
        name: { type: String },
        iconUrl: { type: String }
    }],
    imageUrl: { type: String },
    category: { type: String, default: 'jiaozi' },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);
