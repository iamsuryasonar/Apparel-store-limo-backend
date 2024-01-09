const mongoose = require('mongoose');

const colorVariantSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        maxlength: 25,
    },
    thumbnail: {
        url: {
            type: String,
            required: true,
        },
        filename: {
            type: String,
            required: true,
        },
    },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
},
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

colorVariantSchema.virtual('images', {
    ref: 'Image',
    localField: '_id',
    foreignField: 'colorVariant',
})
colorVariantSchema.virtual('sizevariants', {
    ref: 'SizeVariant',
    localField: '_id',
    foreignField: 'colorVariant',
})


module.exports = mongoose.model('ColorVariant', colorVariantSchema);
