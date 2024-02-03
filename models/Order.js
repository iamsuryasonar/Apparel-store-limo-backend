const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    lockedprice: {
        type: Number,
        required: true,
    },
    totalamount: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        required: true,
        enum: ['ORDERED', 'PROCCESSED', 'CANCELLED', 'TRANSIT', 'DELIVERED'],
        default: 'ORDERED',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    address: { type: mongoose.Schema.Types.ObjectId, ref: 'Address' },
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
});

module.exports = mongoose.model('Order', orderSchema);