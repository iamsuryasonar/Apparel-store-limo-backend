const mongoose = require('mongoose')
const { success, error, validation } = require('../../common/responseAPI')
const Item = require('../../models/Item')
const Order = require('../../models/Order')
const Address = require('../../models/Address')
const SizeVariant = require('../../models/SizeVariant')

exports.createOrder = async (req, res) => {
    try {
        var session = await mongoose.startSession();
        session.startTransaction();

        let {
            contactNumber,
            houseNumber,
            landmark,
            town,
            city,
            pin,
            state,
        } = req.body;

        const customerId = req.user._id;

        const cartItems = await Item.find({ customer: customerId });
        if (!cartItems) return res.status(404).json(error("Cart item not found", res.statusCode));

        // create address
        const address = new Address({
            contactnumber: contactNumber,
            housenumber: houseNumber,
            landmark,
            town,
            city,
            pin,
            state,
            customer: customerId
        });

        await address.save({ session });

        cartItems.forEach(async (item) => {
            const sizevariant = await SizeVariant.findById({ _id: item.sizevariant });
            const total_amount = sizevariant.selling_price * item.quantity;

            const order = new Order(
                {
                    lockedprice: sizevariant.selling_price,
                    totalamount: total_amount,
                    customer: customerId,
                    address: address._id,
                    item: item._id,
                }
            );

            await order.save({ session })

            item.isOrdered = true;
            await item.save({ session });
        })

        const allOrders = await Order.find({ customer: customerId })
            .populate({
                path: 'item',
                populate: [
                    { path: 'product' },
                    { path: 'sizevariant' },
                    { path: 'colorvariant', populate: { path: 'images' } },
                ],
            })
            .populate('address')
            .exec();

        await session.commitTransaction();

        res.status(201).json(success("OK", {
            allOrders
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

exports.getOrdereditems = async (req, res) => {
    try {
        const customerId = req.user._id;
        const orderedItems = await Order.find({ customer: customerId })
            .populate({
                path: 'item',
                populate: [
                    { path: 'product' },
                    { path: 'sizevariant' },
                    { path: 'colorvariant', populate: { path: 'images' } },
                ],
            })
            .populate('address')
            .exec();

        res.status(200).json(success("OK", {
            orderedItems
        },
            res.statusCode),
        );
    } catch (err) {
        console.error(err);
        return res.status(500).json(error("Something went wrong", res.statusCode));
    }
};

exports.cancelOrder = async (req, res) => {
    try {
        var session = await mongoose.startSession();
        session.startTransaction();

        const { id } = req.params;
        const customerId = req.user._id;

        const orderedItem = await Order.find({ _id: id, customer: customerId });
        if (!orderedItem) return res.status(404).json(error("Cart item not found", res.statusCode));

        orderedItem[0].status = 'CANCELLED';
        const cancelledOrderedItems = await orderedItem[0].save({ session });

        await session.commitTransaction();

        res.status(200).json(success("OK", {
            cancelledOrderedItems
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

exports.getCancelledOrder = async (req, res) => {

    try {
        const customerId = req.user._id;

        const cancelledItem = await Order.find({ customer: customerId, status: 'CANCELLED' })
            .populate({
                path: 'item',
                populate: [
                    { path: 'product' },
                    { path: 'sizevariant' },
                    { path: 'colorvariant', populate: { path: 'images' } },
                ],
            })
            .populate('address')
            .exec();

        if (!cancelledItem) return res.status(404).json(error("Item not found", res.statusCode));

        res.status(200).json(success("OK", {
            cancelledItem
        },
            res.statusCode),
        );

    } catch (err) {
        return res.status(500).json(error("Something went wrong", res.statusCode));
    }
};