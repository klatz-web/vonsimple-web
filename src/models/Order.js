const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  orderItems: [{
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
  }],
  shippingAddress: {
    fullName: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
    phone: { type: String, required: true },
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  paymentMethod: {
    type: String,
    enum: ['GCash', 'COD'],
    required: true,
  },
  paymentDetails: {
    referenceNumber: {
      type: String,
      required: function() {
        return this.paymentMethod === 'GCash';
      },
      validate: {
        validator: function(value) {
          // Reference number is required for GCash, optional for COD
          if (this.paymentMethod === 'GCash') {
            return value && value.trim().length > 0;
          }
          return true;
        },
        message: 'Reference number is required for GCash payments'
      }
    }
  },
  isPaid: {
    type: Boolean,
    default: false,
  },
  paymentVerificationStatus: {
    type: String,
    enum: ['Pending', 'Verified', 'Rejected'],
    default: 'Pending',
  },
  paidAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Order', orderSchema);
