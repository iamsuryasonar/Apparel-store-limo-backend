const mongoose = require('mongoose')
const { success, error, validation } = require('../common/responseAPI')
const Item = require('../models/Item')
const Order = require('../models/Order')
const Address = require('../models/Address')
const SizeVariant = require('../models/SizeVariant')
const { FILTER_ITEMS, ORDER_STATUS } = require('../common/constants')

// @desc    Create order
// @route   POST /api/v1/order/
// @access  Private/Customer

exports.createOrder = async (req, res) => {
    try {
        let session = await mongoose.startSession();
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
        session.endSession();

        res.status(201).json(success("OK", {
            allOrders
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

// @desc    Cancel order
// @route   PUT /api/v1/order/:id
// @access  Private/Customer

exports.cancelOrder = async (req, res) => {
    try {
        let session = await mongoose.startSession();
        session.startTransaction();

        const { id } = req.params;
        const customerId = req.user._id;

        const orderedItem = await Order.find({ _id: id, customer: customerId });
        if (!orderedItem) return res.status(404).json(error("Cart item not found", res.statusCode));

        orderedItem[0].status = 'CANCELLED';
        const cancelledOrderedItems = await orderedItem[0].save({ session });

        await session.commitTransaction();
        session.endSession();

        res.status(200).json(success("OK", {
            cancelledOrderedItems
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

// @desc    Get ordered items
// @route   GET /api/v1/order/orders/ordered
// @access  Private/Customer

exports.getOrdereditemsOfUser = async (req, res) => {
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

// @desc    Get cancelled order
// @route   GET /api/v1/order/orders/cancelled
// @access  Private/Customer

exports.getCancelledOrdersOfUser = async (req, res) => {

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

// @desc    Get an order
// @route   GET /api/v1/order/:id
// @access  Private/Customer

exports.getAnOrder = async (req, res) => {
    try {
        const id = req.params.id
        if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json(error("Id is not valid", res.statusCode));

        const order = await Order.findById(id)
            .populate({
                path: 'item',
                populate: [
                    { path: 'product' },
                    { path: 'sizevariant' },
                    { path: 'colorvariant', populate: { path: 'images' } },
                ],
            })
            .populate('address')
            .populate([
                { path: 'customer', select: ['-password', '-isDeleted', '-isBlocked', '-__v', '-role'] },
            ])
            .exec();

        res.status(200).json(success("OK",
            order,
            res.statusCode),
        );
    } catch (err) {
        console.error(err);
        return res.status(500).json(error("Something went wrong", res.statusCode));
    }
};

// @desc    Get all orders in past
// @route   GET /api/v1/order/
// @access  Private/Customer

exports.getAllOrders = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const filter = req.query.filter || 'OLDEST_FIRST';

        let sortOption = {
            createdAt: 1,
        }

        if (filter === FILTER_ITEMS.NEWEST_FIRST) {
            sortOption = {
                createdAt: -1,
            }
        }

        const orders = await Order.find()
            .populate({
                path: 'item',
                populate: [
                    { path: 'product' },
                    { path: 'sizevariant' },
                    { path: 'colorvariant', populate: { path: 'images' } },
                ],
            })
            .populate('address')
            .populate([
                { path: 'customer', select: ['-password', '-isDeleted', '-isBlocked', '-__v', '-role'] },
            ])
            .sort(sortOption)
            .skip(skip)
            .limit(limit)
            .exec();


        const totalOrders = orders.length;

        const totalPages = Math.ceil(totalOrders / limit);

        res.status(200).json(success("OK", {
            orders,
            pagination: {
                page_no: page,
                per_page: limit,
                total_orders: totalOrders,
                total_pages: totalPages,
            },
        },
            res.statusCode),
        );
    } catch (err) {
        console.error(err);
        return res.status(500).json(error("Something went wrong", res.statusCode));
    }
};

// @desc    Get order by status
// @route   GET /api/v1/order/status/:status
// @access  Private/Customer

exports.getAllOrdersByStatus = async (req, res) => {
    try {
        const status = req.params.status

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const filter = req.query.filter || 'OLDEST_FIRST';

        let sortOption = {
            createdAt: 1,
        }

        if (filter === FILTER_ITEMS.NEWEST_FIRST) {
            sortOption = {
                createdAt: -1,
            }
        }

        const orders = await Order.find({ status: status })
            .populate({
                path: 'item',
                populate: [
                    { path: 'product' },
                    { path: 'sizevariant' },
                    { path: 'colorvariant', populate: { path: 'images' } },
                ],
            })
            .populate('address')
            .populate([
                { path: 'customer', select: ['-password', '-isDeleted', '-isBlocked', '-__v', '-role'] },
            ])
            .sort(sortOption)
            .skip(skip)
            .limit(limit)
            .exec();

        const totalOrders = orders.length;

        const totalPages = Math.ceil(totalOrders / limit);

        res.status(200).json(success("OK", {
            orders,
            pagination: {
                page_no: page,
                per_page: limit,
                total_orders: totalOrders,
                total_pages: totalPages,
            },
        },
            res.statusCode),
        );
    } catch (err) {
        console.error(err);
        return res.status(500).json(error("Something went wrong", res.statusCode));
    }
};

// @desc    Update order status
// @route   PUT /api/v1/order/status/:id
// @access  Private/Customer


exports.updateOrderStatus = async (req, res) => {
    let session = await mongoose.startSession();
    try {
        session.startTransaction();

        const { id } = req.params;
        const {
            status
        } = req.body;

        if (!ORDER_STATUS.includes(status)) return res.status(500).json(error("Status not valid", res.statusCode));

        const order = await Order.findById(id);
        if (!order) return res.status(404).json(error("Order not found", res.statusCode));

        order.status = status;
        await order.save({ session });
        await session.commitTransaction();
        session.endSession();
        res.status(200).json(success("OK", {
            order
        },
            res.statusCode),
        );
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        return res.status(500).json(error("Something went wrong", res.statusCode));
    } 
};