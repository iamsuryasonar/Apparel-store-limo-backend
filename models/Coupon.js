//items are cart items if not ordered but it is ordered item if ordered recognised by a flag named ordered.
const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    },
    discount: {
        type: String,
    },
    codeName: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Coupon', couponSchema);