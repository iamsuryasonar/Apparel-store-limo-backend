const mongoose = require('mongoose')
const { success, error, validation } = require('../common/responseAPI')
const Review = require('../models/Review');
const Product = require('../models/Product');



// @desc    Get review
// @route   GET /api/v1/review/
// @access  Public

exports.getReview = async (req, res) => {
    try {
        const { productId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const reviews = await Review.find({ product: productId, isActive: true })
            .skip(skip)
            .limit(limit)
            .exec();

        const totalReviews = await Review.countDocuments({ product: productId, isActive: true });

        const totalPages = Math.ceil(totalReviews / limit);

        res.status(200).json(success("OK", {
            reviews,
            pagination: {
                page_no: page,
                per_page: limit,
                total_reviews: totalReviews,
                total_pages: totalPages,
            },
        },
            res.statusCode),
        );
    } catch (err) {
        return res.status(500).json(error("Something went wrong", res.statusCode));

    }
};


// @desc    Create review
// @route   POST /api/v1/review/
// @access  Private/Customer

exports.addReview = async (req, res) => {
    try {
        let {
            message,
            rating,
            productId,
        } = req.body;

        if (!productId) return res.status(400).json(error("Product id not found", res.statusCode));

        const customerId = req?.user._id;
        if (!customerId) return res.status(400).json(error("Can't add review", res.statusCode));

        const review = await Review.find({ product: productId, customer: customerId });

        const product = await Product.findById({ _id: review[0].product });
        if (!product) return res.status(404).json(error("Product not found", res.statusCode));

        let new_review = {}

        if (review.length === 0) { // add review if it does not exist else update the existing one
            const review = new Review({
                message,
                rating,
                product: productId,
                reviewer_name: `${req?.user?.firstName} ${req?.user?.lastName}`,
                customer: customerId,
            });

            new_review = await review.save();

            let count = !product?.reviewCount ? 1 : Number(product?.reviewCount) + 1;
            let totalRating = !product?.totalRating ? Number(rating) : (Number(product?.totalRating) + Number(rating)) / Number(count);

            product.reviewCount = count;
            product.totalRating = totalRating;
            const updatedProduct = await product.save();

        } else {
            new_review = await Review.findByIdAndUpdate(
                { _id: review[0]._id, customer: customerId },
                {
                    message,
                    rating,
                },
            );
        }

        res.status(201).json(success("OK", new_review,
            res.statusCode),
        );
    } catch (err) {
        console.log(err)
        return res.status(500).json(error("Something went wrong", res.statusCode));
    }
};

// @desc    Update review
// @route   PUT /api/v1/review/
// @access  Private/Customer

exports.updateReview = async (req, res) => {
    try {
        const {
            message,
            rating,
        } = req.body;

        const customerId = req?.user._id;
        if (!customerId) return res.status(400).json(error("Can't update review", res.statusCode));

        const review = await Review.find({ _id: req.params.id, customer: customerId });
        console.log(review)

        if (!review) return res.status(404).json(error("Review not found", res.statusCode));

        const product = await Product.findById({ _id: review[0].product });
        if (!product) return res.status(404).json(error("Product not found", res.statusCode));
        console.log(review)

        if (review[0]?.rating && rating !== review[0].rating) {
            // subtract contribution by previous rating and add contribution of new rating
            let contributionOfPreviousRating = Number(review[0].rating) / Number(product.reviewCount);
            let totalRating = !product?.totalRating ? Number(rating) : (Number(product.totalRating) - contributionOfPreviousRating) + (Number(rating) / Number(product.reviewCount));

            product.totalRating = totalRating;
            const updatedProduct = await product.save();
        }

        const updatedReview = await Review.findByIdAndUpdate(
            { _id: req.params.id, customer: customerId },
            {
                message,
                rating,
            },
        );

        res.status(200).json(success("Review updated successfully", updatedReview, res.statusCode));
    } catch (err) {
        console.log(err);
        return res.status(500).json(error("Something went wrong", res.statusCode));
    }
};

// @desc    Delete review
// @route   DELETE /api/v1/review/:id
// @access  Private/Customer

exports.deleteReview = async (req, res) => {
    try {
        const customerId = req.user._id;
        if (!customerId) return res.status(404).json(error("", res.statusCode));

        const review = await Review.find({ _id: req.params.id, customer: customerId });
        if (!review) return res.status(404).json(error("Review not found", res.statusCode));

        const product = await Product.findById({ _id: review[0].product });
        if (!product) return res.status(404).json(error("Product not found", res.statusCode));

        let contributionOfPreviousRating = Number(review[0].rating) / Number(product.reviewCount);
        let totalRating = (Number(product?.totalRating) - contributionOfPreviousRating);

        product.reviewCount = Number(product.reviewCount) - 1;
        product.totalRating = totalRating;
        const updatedProduct = await product.save();

        let deletedReview = await Review.deleteOne({ _id: req.params.id });

        res.status(201).json(success("OK", {
            deletedReview
        },
            res.statusCode),
        );
    } catch (err) {
        console.log(err)
        return res.status(500).json(error("Something went wrong", res.statusCode));
    }
};
