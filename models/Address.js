const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    contactnumber: {
        type: Number,
        minlength: 10,
        maxlength: 10,
        required: true,
    },
    housenumber: {
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
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
});

module.exports = mongoose.model('Address', addressSchema);