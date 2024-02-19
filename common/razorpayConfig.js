const Razorpay = require('razorpay');
const config = require('../config');

const razorpay = new Razorpay({
    key_id: config.razorpay.key,
    key_secret: config.razorpay.secret,
});

module.exports = {
    razorpay
}