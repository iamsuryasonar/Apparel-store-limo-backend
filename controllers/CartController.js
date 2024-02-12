const mongoose = require('mongoose')
const { success, error, validation } = require('../common/responseAPI')
const Item = require('../models/Item')
const Product = require('../models/Product')

// @desc   Add to cart
// @route   POST /api/v1/cart/
// @access  Private/Customer

exports.addToCart = async (req, res) => {

    try {
        let session = await mongoose.startSession();
        session.startTransaction();

        let { quantity, productId, colorVariantId, sizeVariantId } = req.body;
        const customerId = req.user._id;

        const product = await Product.findById(productId);
        if (!product) return res.status(404).json(error("Product not found", res.statusCode));

        let item = await Item.find({ sizevariant: sizeVariantId });
        let cart = [];

        // max quantity limit reached
        if (item && item?.length === 1 && item[0]?.quantity >= 5) return res.status(201).json(success("Can't purchase more than 5 items!", {
            item
        },
            res.statusCode),
        );

        // item already exist in cart
        if (item.length === 1 && item[0]?.quantity < 5) {
            item[0].quantity = item[0].quantity + 1;
            cart = await item[0].save({ session });
        }
        if (item?.length === 0) {// if limit not reached and item don't already exists in the cart then, go ahead and create new Item
            cart = await Item.create(
                [{
                    quantity,
                    product: productId,
                    colorvariant: colorVariantId,
                    sizevariant: sizeVariantId,
                    customer: customerId
                }],
                { session }
            );
        }

        await session.commitTransaction();
        session.endSession();

        res.status(201).json(success("OK", {
            cart
        },
            res.statusCode),
        );
    } catch (err) {
        console.log(err);
        await session.abortTransaction();
        session.endSession();
        return res.status(500).json(error("Something went wrong", res.statusCode));
    }
};

// @desc   Get all items in cart
// @route   GET /api/v1/cart/
// @access  Private/Customer

exports.getAllItemsInCart = async (req, res) => {
    try {
        const customerId = req.user._id;
        const cartItems = await Item.find({ customer: customerId, isOrdered: false })
            .populate(['product', 'sizevariant'])
            .populate({
                path: 'colorvariant',
                populate: ['images']
            })
            .exec();

        res.status(200).json(success("OK", {
            cartItems
        },
            res.statusCode),
        );
    } catch (err) {
        console.error(err);
        return res.status(500).json(error("Something went wrong", res.statusCode));
    }
};

// @desc   Update quatify of item in cart
// @route   PUT /api/v1/cart/:id
// @access  Private/Customer

exports.updateProductQuantity = async (req, res) => {
    try {
        let session = await mongoose.startSession();
        session.startTransaction();

        const { id } = req.params;
        let { type, productId } = req.body;
        const customerId = req.user._id;

        const product = await Product.findById(productId);
        if (!product) return res.status(404).json(error("Product not found", res.statusCode));

        const item = await Item.findById(id);
        if (!item) return res.status(404).json(error("Cart item not found", res.statusCode));

        const cartItem = await Item.find({ _id: id, isOrdered: false, customer: customerId });
        if (!cartItem) return res.status(404).json(error("Cart item not found", res.statusCode));

        if (type === 'DECREMENT' && cartItem[0].quantity === 1) {
            let deletedItem = await Item.deleteOne({ _id: req.params.id, isOrdered: false }, { session });

            await session.commitTransaction();
            session.endSession();

            return res.status(201).json(success("OK", {
                deletedItem
            },
                res.statusCode),
            );
        }

        if (type === 'INCREMENT' && cartItem[0].quantity < 5) cartItem[0].quantity = cartItem[0].quantity + 1;

        if (type === 'DECREMENT' && cartItem[0].quantity > 0) cartItem[0].quantity = cartItem[0].quantity - 1;

        await cartItem[0].save({ session });

        await session.commitTransaction();
        session.endSession();

        res.status(201).json(success("OK", {
            cartItem
        },
            res.statusCode),
        );
    } catch (err) {
        console.log(err)
        await session.abortTransaction();
        session.endSession();
        return res.status(500).json(error("Something went wrong", res.statusCode));
    }
};

// @desc    Remove item from cart
// @route   PUT /api/v1/cart/:id
// @access  Private/Customer

exports.removeItemFromCart = async (req, res) => {
    try {
        let session = await mongoose.startSession();
        session.startTransaction();

        const { id } = req.params;
        const customerId = req.user._id;

        const cartItem = await Item.find({ _id: req.params.id, isOrdered: false, customer: customerId });

        if (!cartItem) return res.status(404).json(error("Cart item not found", res.statusCode));

        let deletedItem = await Item.deleteOne({ _id: req.params.id, isOrdered: false }, { session });

        await session.commitTransaction();
        session.endSession();

        res.status(201).json(success("OK", {
            deletedItem
        },
            res.statusCode),
        );
    } catch (err) {
        console.log(err)
        await session.abortTransaction();
        session.endSession();
        return res.status(500).json(error("Something went wrong", res.statusCode));
    }
};