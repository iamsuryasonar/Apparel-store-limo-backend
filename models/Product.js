const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 6,
        maxlength: 255,
    },
    description: {
        type: String,
        required: true,
        minlength: 6,
        maxlength: 255,
    },
    image: {
        type: String,
        required: true,
    },
    keyword: {
        type: String,
        minlength: 3,
        maxlength: 255,
    },
    tag: {
        type: String,
        minlength: 3,
        maxlength: 255,
    },
    mrp: {
        type: Number,
        required: true,
    },
    selling_price: {
        type: Number,
        required: true,
    },
    stock: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        required: true,
        enum: ['IN-STOCK', 'OUT-STOCK'],
        default: 'IN-STOCK',
    },
});

module.exports = mongoose.model('Product', productSchema);
