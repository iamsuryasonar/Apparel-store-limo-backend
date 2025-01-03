const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    maxlength: 255,
  },
  lastName: {
    type: String,
    required: true,
    maxlength: 255,
  },
  email: {
    type: String,
    unique: true,
    required: true,
    minlength: 6,
    maxlength: 255,
    index: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    maxlength: 500,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  role: {
    type: String,
    default: 'CUSTOMER'
  },
  isBlocked: {
    type: Boolean,
    default: false,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },

}, {
  timestamps: true, // Automatically add createdAt and updatedAt fields
});

module.exports = mongoose.model("Customer", customerSchema);