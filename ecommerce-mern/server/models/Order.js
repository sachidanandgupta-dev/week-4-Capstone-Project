const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        name: String,
        price: Number,
        image: String,
        qty: { type: Number, required: true, min: 1 },
      },
    ],
    address: {
      fullName: String, line1: String, city: String, postalCode: String, phone: String,
    },
    total: { type: Number, required: true },
    paymentMethod: { type: String, default: 'COD' },
    status: { type: String, enum: ['placed', 'shipped', 'delivered', 'cancelled'], default: 'placed' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
