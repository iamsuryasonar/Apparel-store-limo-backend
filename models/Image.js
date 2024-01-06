const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
    image: Buffer,
    colorVariant: { type: mongoose.Schema.Types.ObjectId, ref: 'ColorVariant' }
});

module.exports = mongoose.model('Image', imageSchema);