const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    message: {
        type: String,
        maxlength: 500,
    },
    rating: {
        type: Number,
        required: true,
        default: 5,
    },
    reviewer_name: {
        type: String,
        required: true,
    },
    isActive: {
        type: Boolean,
        default: true,
        required: true,
    },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', index: true },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Review', reviewSchema);