const mongoose = require('mongoose');

const foodListingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a food title'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    foodType: {
      type: String,
      enum: ['veg', 'non-veg', 'vegan', 'bakery', 'packaged', 'other'],
      default: 'veg',
    },
    quantity: {
      type: Number,
      required: [true, 'Please specify quantity'],
      min: [1, 'Quantity must be at least 1'],
    },
    unit: {
      type: String,
      enum: ['plates', 'kg', 'packets', 'liters', 'items'],
      default: 'plates',
    },
    pickupLocation: {
      address: {
        type: String,
        required: [true, 'Pickup street address is required'],
        trim: true,
      },
      city: {
        type: String,
        required: [true, 'City is required'],
        trim: true,
      },
      pincode: {
        type: String,
        trim: true,
        default: '',
      },
    },
    availableFrom: {
      type: Date,
      required: [true, 'Available from date/time is required'],
    },
    expiryDate: {
      type: Date,
      required: [true, 'Expiry date/time is required'],
      validate: {
        validator: function (value) {
          return value > this.availableFrom;
        },
        message: 'Expiry date must be after availableFrom date',
      },
    },
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['available', 'requested', 'claimed', 'completed', 'expired', 'cancelled'],
      default: 'available',
    },
    claimedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    imageUrl: {
      type: String,
      default: '',
    },
    contactPhone: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
foodListingSchema.index({ title: 'text', description: 'text' });
foodListingSchema.index({ status: 1, expiryDate: 1 });
foodListingSchema.index({ donor: 1 });
foodListingSchema.index({ 'pickupLocation.city': 1 });

module.exports = mongoose.model('FoodListing', foodListingSchema);
