const mongoose = require('mongoose');

const sizeVariantSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        maxlength: 25,
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
    colorVariant: { type: mongoose.Schema.Types.ObjectId, ref: 'ColorVariant' }
});


module.exports = mongoose.model('SizeVariant', sizeVariantSchema);
