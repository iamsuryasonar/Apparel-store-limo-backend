const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
    url: {
        type: String,
        required: true,
    },
    filename: {
        type: String,
        required: true,
    },
    colorVariant: { type: mongoose.Schema.Types.ObjectId, ref: 'ColorVariant' }
});

module.exports = mongoose.model('Image', imageSchema);