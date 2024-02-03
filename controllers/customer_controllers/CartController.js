const mongoose = require('mongoose')
const { success, error, validation } = require('../../common/responseAPI')
const Item = require('../../models/Item')
const Product = require('../../models/Product')

exports.addToCart = async (req, res) => {

    try {
        // Todo: should not add same product-sizeVariant twice
        let session = await mongoose.startSession();
        session.startTransaction();

        let { quantity, productId, colorVariantId, sizeVariantId } = req.body;
        const customerId = req.user._id;

        const product = await Product.findById(productId);
        if (!product) return res.status(404).json(error("Product not found", res.statusCode));

        const cart = await Item.create(
            [{
                quantity,
                product: productId,
                colorvariant: colorVariantId,
                sizevariant: sizeVariantId,
                customer: customerId
            }],
            { session }
        );

        await session.commitTransaction();

        res.status(201).json(success("OK", {
            cart
        },
            res.statusCode),
        );
    } catch (err) {
        console.log(err);
        await session.abortTransaction();
        return res.status(500).json(error("Something went wrong", res.statusCode));
    } finally {
        session.endSession();
    }
};

exports.getAllItemsInCart = async (req, res) => {
    try {
        const customerId = req.user._id;
        const cartItems = await Item.find({ customer: customerId, isOrdered: false })
            .populate({
                path: 'colorvariant',
                populate: ['images', 'sizevariants']
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

exports.updateProductQuantity = async (req, res) => {
    try {
        let session = await mongoose.startSession();
        session.startTransaction();

        const { id } = req.params;
        let { quantity, productId } = req.body;
        const customerId = req.user._id;

        const product = await Product.findById(productId);
        if (!product) return res.status(404).json(error("Product not found", res.statusCode));

        const item = await Item.findById(id);
        if (!item) return res.status(404).json(error("Cart item not found", res.statusCode));

        const cartItem = await Item.find({ _id: id, isOrdered: false, customer: customerId });
        if (!cartItem) return res.status(404).json(error("Cart item not found", res.statusCode));

        if (quantity === 0 || quantity === '0') {
            let deletedItem = await Item.deleteOne([{ _id: req.params.id, isOrdered: false }], { session });

            return res.status(201).json(success("OK", {
                deletedItem
            },
                res.statusCode),
            );
        }

        cartItem[0].quantity = quantity;
        cartItem[0].save({ session });

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

        res.status(201).json(success("OK", {
            deletedItem
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