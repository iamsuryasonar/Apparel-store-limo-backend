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
    keyword: {
        type: String,
        minlength: 3,
    },
    tag: {
        type: String,
        minlength: 3,
        maxlength: 255,
    },
    isPublished: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
},
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

productSchema.virtual('colorvariants', {
    ref: 'ColorVariant',
    localField: '_id',
    foreignField: 'product',
})


module.exports = mongoose.model('Product', productSchema);