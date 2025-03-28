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
    totalSold: {
        type: Number,
        default: 0,
    },
    status: {
        type: String,
        required: true,
        enum: ['IN-STOCK', 'OUT-STOCK'],
        default: 'IN-STOCK',
    },
    colorVariant: { type: mongoose.Schema.Types.ObjectId, ref: 'ColorVariant', index: true }
}, {
    timestamps: true, // Automatically add createdAt and updatedAt fields
});

sizeVariantSchema.virtual('qtyLeft').get(function () {
    const item = this;
    return item.stock - item.totalSold;
})

module.exports = mongoose.model('SizeVariant', sizeVariantSchema);