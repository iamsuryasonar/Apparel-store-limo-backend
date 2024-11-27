const { success, error } = require('../common/responseAPI');
const { razorpay } = require('../common/razorpayConfig');
const Item = require('../models/Item');
const SizeVariant = require('../models/SizeVariant');
const Razorpay = require('razorpay');
const config = require('../config');
const crypto = require('crypto');
const OrderController = require('../controllers/OrderController');
// @desc   create payment order
// @route   POST /api/v1/payment/
// @access  Customer/Private

exports.createPaymentOrder = async (req, res) => {
    try {
        const customerId = req?.user?._id;
        const cartItems = await Item.find({ customer: customerId, isOrdered: false });
        if (!cartItems) return res.status(404).json(error("Cart item not found", res.statusCode));

        let total_amount = 0;

        for (const item of cartItems) {
            const sizevariant = await SizeVariant.findById({ _id: item.sizevariant });
            let amount = sizevariant.selling_price * item.quantity;
            total_amount = total_amount + amount;
        }

        let options = {
            amount: total_amount * 100, //amount takes in paise
            currency: "INR",
            receipt: "order_rcptid_111"//todo need to be dynamically generated
        };

        razorpay.orders.create(options, function (err, order) {
            if (order) return res.status(201).json(success("OK", order, res.statusCode));
            if (err) {
                console.log(err)
                return res.status(500).json(error("Something went wrong", res.statusCode));
            }
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json(error("Something went wrong", res.statusCode));
    }
};

exports.validatePaymentOrder = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        const sha = crypto.createHmac("sha256", config.razorpay.secret)
        sha.update(`${razorpay_order_id}|${razorpay_payment_id}`);
        const digest = sha.digest("hex");

        if (digest !== razorpay_signature) {
            return res.status(400).json(error("Payment invalid", res.statusCode));
        } else {
            OrderController.createOrder(req, res);
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json(error("Something went wrong", res.statusCode));
    }
};