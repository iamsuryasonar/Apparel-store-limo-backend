const Order = require('../../models/Order');
const mongoose = require('mongoose')
const { success, error, validation } = require('../../responseAPI')
const sharp = require('sharp')
const { uploadTos3, deleteS3Object } = require('../../middlewares/multerConfig')

exports.getAllOrders = async (req, res) => {
    // pagination required
    try {
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
            .exec();
        console.log(orders)
        res.status(200).json(success("OK", {
            orders
        },
            res.statusCode),
        );
    } catch (err) {
        console.error(err);
        return res.status(500).json(error("Something went wrong", res.statusCode));
    }
};

exports.updateOrder = async (req, res) => {
    let session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { id } = req.params;
        const {
            path,
            name,
            isActive
        } = req.body;

        console.log(req.path)

        const category = await Category.findById(req.params.id);

        if (!category) return res.status(404).json(error("Category not found", res.statusCode));

        if (req?.files && req?.files['image'] && req?.files['image'][0] !== null && path) {
            const bannerImage = req.files['image'][0];

            //convert to webp with quality 20%
            const bannerImageWebp = await sharp(bannerImage.buffer)
                .webp([{ near_lossless: true }, { quality: 20 }])
                .toBuffer();

            let bannerImageInfo;
            await uploadTos3(bannerImageWebp).then((result) => {
                bannerImageInfo = result;
            })



            console.log(bannerImageInfo);

            category.bannerImage = {
                url: bannerImageInfo.url,
                filename: bannerImageInfo.fileName
            };
        }

        if (name) {
            category.name = name;
        }

        if (isActive) {
            category.isActive = isActive;
        }

        await category.save({ session });
        await session.commitTransaction();
        await session.endSession();

        const updatedCategory = await Category.findById(id);

        if (path && updatedCategory) {
            await deleteS3Object(path).then((result) => {
            })
        }

        res.status(200).json(success("OK", {
            updatedCategory
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