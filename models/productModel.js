const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true
    },
    sku: {
        type: String,
        required: [true, 'SKU is required'],
        unique: true,
        trim: true
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: 0
    },
    stock: {
        type: Number,
        required: [true, 'Stock quantity is required'],
        min: 0
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    weight: {
        type: Number,
        min: 0
    },
    dimensions: {
        length: { type: Number, min: 0 },
        width: { type: Number, min: 0 },
        height: { type: Number, min: 0 }
    },
    shippingClass: {
        type: String,
        enum: ['standard', 'express', 'overnight'],
        default: 'standard'
    },
    features: [{
        type: String,
        trim: true
    }],
    images: [{
        type: String,
        trim: true
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Product', productSchema);