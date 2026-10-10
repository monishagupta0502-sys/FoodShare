const mongoose = require('mongoose');

const pickupRequestSchema = new mongoose.Schema(
  {
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FoodListing',
      required: [true, 'Associated food listing is required'],
    },
    ngo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Requesting NGO is required'],
    },
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Donor is required'],
    },
    message: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'cancelled', 'completed'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index so an NGO cannot request the same listing twice
pickupRequestSchema.index({ listing: 1, ngo: 1 }, { unique: true });
pickupRequestSchema.index({ donor: 1, status: 1 });
pickupRequestSchema.index({ ngo: 1, status: 1 });

module.exports = mongoose.model('PickupRequest', pickupRequestSchema);
