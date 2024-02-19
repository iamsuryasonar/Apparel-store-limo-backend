const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    // price that was on the time the order was made.
    lockedprice: {
        type: Number,
        required: true,
    },
    // selling_price that was on the time the order was made * quantity of item purchased
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
    payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
    // deliveredAt: {type:Date,} this property needs to be added
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    address: { type: mongoose.Schema.Types.ObjectId, ref: 'Address' },
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
});

module.exports = mongoose.model('Order', orderSchema);