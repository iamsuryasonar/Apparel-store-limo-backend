const mongoose = require('mongoose')
const { success, error, validation } = require('../common/responseAPI')
const Item = require('../models/Item')
const Product = require('../models/Product')
const async = require('async');
const QUANTITY_LIMIT = 5;

// Create a queue with concurrency 1 (only one task at a time)
const queue = async.queue(async (task, callback) => {
    await task.funct(task.req, task.res);
    // Callback to signal completion (worker is free to execute next task)
    callback();
}, 1);

const addToCartQueue = async (req, res) => {
    console.log('here')
    let session;
    try {
        session = await mongoose.startSession();
        session.startTransaction();

        let { quantity, productId, colorVariantId, sizeVariantId } = req.body;
        const customerId = req.user._id;

        const product = await Product.findById(productId);
        if (!product) return res.status(404).json(error("Product not found", res.statusCode));

        let item = await Item.findOne({ sizevariant: sizeVariantId, customer: customerId }).session(session);;
        let cart = [];

        // quantity can't exceed quantity limit 
        if (quantity > QUANTITY_LIMIT) return res.status(201).json(success("Can't purchase more than" + QUANTITY_LIMIT + "items!", {
            item
        },
            res.statusCode),
        );

        // if item already exists in cart and quantity is provided
        if (item && quantity) {
            console.log('item already exists', item.quantity, 'qty to add', quantity, 'Could add', QUANTITY_LIMIT - item.quantity)

            if (quantity > QUANTITY_LIMIT - item.quantity) {//if quantity to add is greater than quantity could be added, replace quantity with quantity that could be added
                quantity = QUANTITY_LIMIT - item.quantity;
            }

            item.quantity = item.quantity + Number(quantity);
            cart = await item.save({ session });
        } else { // if limit not reached and item doesn't already exist in the cart then, go ahead and create new Item
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

        res.status(201).json(success("OK", {
            // cart
        },
            res.statusCode),
        );
    } catch (err) {
        console.log(err);
        await session.abortTransaction();
        session.endSession();
        return res.status(500).json(error("Something went wrong", res.statusCode));
    } finally {
        session.endSession();
    }
};


const updateProductQuantityQueue = async (req, res) => {
    let session;
    try {
        session = await mongoose.startSession();
        session.startTransaction();

        const { id } = req.params;
        let { quantity } = req.body;
        const customerId = req.user._id;

        if (!quantity) return res.status(400).json(error("Quantity required!", res.statusCode));
        if (quantity > 5) return res.status(400).json(error("Quantity should be less than 6", res.statusCode));

        let cartItem = await Item.findOne({ _id: id, isOrdered: false, customer: customerId });
        if (!cartItem) return res.status(404).json(error("Cart item not found", res.statusCode));


        if (quantity === 0) {
            let deletedItem = await Item.deleteOne({ _id: req.params.id, isOrdered: false }, { session });

            await session.commitTransaction();

            return res.status(201).json(success("OK", {
                deletedItem
            },
                res.statusCode),
            );
        }

        cartItem.quantity = quantity;
        await cartItem?.save({ session });

        await session.commitTransaction();

        res.status(201).json(success("OK", {
            cartItem
        },
            res.statusCode),
        );
    } catch (err) {
        console.log(err)
        await session.abortTransaction();
        return res.status(500).json(error("Something went wrong", res.statusCode));
    } finally {
        session.endSession();
    }
};

// @desc   Add to cart
// @route   POST /api/v1/cart/
// @access  Private/Customer

// Function to handle addToCart requests one at a time to achieve ACID support in concurrent request
exports.addToCart = async (req, res) => {
    // Add the request and response objects to the queue
    queue.push({ funct: addToCartQueue, req, res });
};

// @desc   Update quatify of item in cart
// @route   PUT /api/v1/cart/:id
// @access  Private/Customer

// Function to handle addToCart requests one at a time to achieve ACID support in concurrent request
exports.updateProductQuantity = async (req, res) => {
    // Add the request and response objects to the queue
    queue.push({ funct: updateProductQuantityQueue, req, res });
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