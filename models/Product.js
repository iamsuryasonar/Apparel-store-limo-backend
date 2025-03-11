const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 4,
        maxlength: 255,
    },
    description: {
        type: String,
        required: true,
        minlength: 6,
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Unisex'],
        default: 'Unisex',
    },
    keyword: {
        type: String,
        minlength: 3,
    },
    tag: {
        type: String,
        enum: ['Popular', 'Most purchased', 'New arrival'],
        default: 'New arrival',
        minlength: 3,
        maxlength: 255,
    },
    isPublished: {
        type: Boolean,
        default: false,
        index: true,
    },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
},
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

productSchema.virtual('colorvariants', {
    ref: 'ColorVariant',
    localField: '_id',
    foreignField: 'product',
})

productSchema.virtual('reviews', {
    ref: 'Review',
    localField: '_id',
    foreignField: 'product',
    match: { isActive: true }
})

productSchema.index({ tag: 1, isPublished: 1 });
productSchema.index({ category: 1, isPublished: 1 });

module.exports = mongoose.model('Product', productSchema);