const Order = require('../models/Order');
const { success, error } = require('../common/responseAPI')

// @desc   Get dashboad analytics
// @route   GET /api/v1/analytics/
// @access  Admin/Private

exports.getAnalytics = async (req, res) => {
    try {
        const totalOrders = await Order.countDocuments();
        const totalOrderedOrders = await Order.countDocuments({ status: 'ORDERED' });
        const totalProcessedOrders = await Order.countDocuments({ status: 'PROCESSED' });
        const totalInTransitOrders = await Order.countDocuments({ status: 'TRANSIT' });
        const totalDeliveredOrders = await Order.countDocuments({ status: 'DELIVERED' });
        const totalCancelledOrders = await Order.countDocuments({ status: 'CANCELLED' });

        const latestOrders = await Order.find()
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
            .sort({
                createdAt: -1,
            })
            .limit(8)
            .exec();

        const totalRevenue = await Order.aggregate([
            {
                $match: {
                    status: { $ne: 'CANCELLED' },
                },
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$totalamount' },
                },
            },
        ]);

        const result = {
            totalOrders,
            totalOrderedOrders,
            totalProcessedOrders,
            totalInTransitOrders,
            totalDeliveredOrders,
            totalCancelledOrders,
            totalRevenue: totalRevenue[0].totalRevenue,
            latestOrders,
        }
        res.status(200).json(success("OK", result, res.statusCode));
    } catch (err) {
        console.error(err);
        return res.status(500).json(error("Something went wrong", res.statusCode));
    }
};


