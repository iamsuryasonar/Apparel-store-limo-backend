const Order = require('../../models/Order');
const mongoose = require('mongoose')
const { success, error, validation } = require('../../responseAPI')
const { filterItems } = require('../../common/constants')

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

exports.getAllOrders = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const filter = req.query.filter || 'OLDEST_FIRST';

        let sortOption = {
            createdAt: 1,
        }

        if (filter === filterItems.NEWEST_FIRST) {
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

        const totalOrders = await Order.countDocuments();
        console.log(orders)

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

exports.getAllProcessedOrders = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const filter = req.query.filter || 'OLDEST_FIRST';

        let sortOption = {
            createdAt: 1,
        }

        if (filter === filterItems.NEWEST_FIRST) {
            sortOption = {
                createdAt: -1,
            }
        }

        const orders = await Order.find({ status: 'PROCCESSED' })
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

        const totalOrders = await Order.countDocuments();

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

exports.getAllOrderedOrders = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const filter = req.query.filter || 'OLDEST_FIRST';

        let sortOption = {
            createdAt: 1,
        }

        if (filter === filterItems.NEWEST_FIRST) {
            sortOption = {
                createdAt: -1,
            }
        }

        const orders = await Order.find({ status: 'ORDERED' })
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

        const totalOrders = await Order.countDocuments();

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

exports.getAllCancelledOrders = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const filter = req.query.filter || 'OLDEST_FIRST';

        let sortOption = {
            createdAt: 1,
        }

        if (filter === filterItems.NEWEST_FIRST) {
            sortOption = {
                createdAt: -1,
            }
        }

        const orders = await Order.find({ status: 'CANCELLED' })
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

        const totalOrders = await Order.countDocuments();

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

exports.getAllTransitOrders = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const filter = req.query.filter || 'OLDEST_FIRST';

        let sortOption = {
            createdAt: 1,
        }

        if (filter === filterItems.NEWEST_FIRST) {
            sortOption = {
                createdAt: -1,
            }
        }

        const orders = await Order.find({ status: 'TRANSIT' })
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

        const totalOrders = await Order.countDocuments();

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

exports.getAllDeliveredOrders = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const filter = req.query.filter || 'OLDEST_FIRST';

        let sortOption = {
            createdAt: 1,
        }

        if (filter === filterItems.NEWEST_FIRST) {
            sortOption = {
                createdAt: -1,
            }
        }

        const orders = await Order.find({ status: 'DELIVERED' })
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

        const totalOrders = await Order.countDocuments();

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

exports.updateOrderStatus = async (req, res) => {
    let session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { id } = req.params;
        const {
            status
        } = req.body;

        const ORDERSTATUS = ['ORDERED', 'PROCCESSED', 'CANCELLED', 'TRANSIT', 'DELIVERED']
        if (!ORDERSTATUS.includes(status)) return res.status(500).json(error("Status not valid", res.statusCode));

        const order = await Order.findById(id);

        if (!order) return res.status(404).json(error("Order not found", res.statusCode));

        order.status = status;
        await order.save({ session });
        await session.commitTransaction();
        await session.endSession();

        res.status(200).json(success("OK", {
            order
        },
            res.statusCode),
        );
    } catch (err) {
        await session.abortTransaction();
        return res.status(500).json(error("Something went wrong", res.statusCode));
    } finally {
        session.endSession();
    }
};