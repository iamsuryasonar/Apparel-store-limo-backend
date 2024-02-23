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
    name: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 255,
    },
    contact_number: {
        type: Number,
        minlength: 10,
        maxlength: 10,
        required: true,
    },
    house_number: {
        type: String,
    },
    town: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 255,
    },
    city: {
        type: String,
        required: true,
        minlength: 2,
        required: true,
    },
    landmark: {
        type: String,
        minlength: 2,
    },
    pin: {
        type: Number,
        minlength: 6,
        maxlength: 6,
        required: true,
    },
    state: {
        type: String,
        minlength: 2,
        maxlength: 255,
        required: true,
    },
    country: {
        type: String,
        minlength: 2,
        maxlength: 255,
        required: true,
    },
    payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
    // deliveredAt: {type:Date,} this property needs to be added
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    address: { type: mongoose.Schema.Types.ObjectId, ref: 'Address' },
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
}, {
    timestamps: true, // Automatically add createdAt and updatedAt fields
});

module.exports = mongoose.model('Order', orderSchema);