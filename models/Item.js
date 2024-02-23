//items are cart items if not ordered but it is ordered item if ordered recognised by a flag named ordered.
const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    quantity: {
        type: Number,
        required: true,
    },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    colorvariant: { type: mongoose.Schema.Types.ObjectId, ref: 'ColorVariant' },
    sizevariant: { type: mongoose.Schema.Types.ObjectId, ref: 'SizeVariant' },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    isOrdered: {
        type: Boolean,
        default: false,
    },
   
}, {
    timestamps: true, // Automatically add createdAt and updatedAt fields
});

module.exports = mongoose.model('Item', itemSchema);