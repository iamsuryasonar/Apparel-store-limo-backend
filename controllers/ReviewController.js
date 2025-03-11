const mongoose = require('mongoose')
const { success, error, validation } = require('../common/responseAPI')
const Review = require('../models/Review');


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

        let new_review = {}

        if (review.length === 0) { // add review if it does not exist else update the existing one
            const review = new Review({
                message,
                rating,
                product: productId,
                reviewer_name: `${req?.user?.firstName} ${req?.user?.lastName}`,
                customer: customerId
            });

            new_review = await review.save();
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

        if (!review) return res.status(404).json(error("Review not found", res.statusCode));

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
// @route   PUT /api/v1/review/:id
// @access  Private/Customer

exports.deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        const customerId = req.user._id;
        if (!customerId) return res.status(404).json(error("", res.statusCode));

        const review = await Review.find({ _id: req.params.id, customer: customerId });

        if (!review) return res.status(404).json(error("Review not found", res.statusCode));

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
