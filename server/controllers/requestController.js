const PickupRequest = require('../models/PickupRequest');
const FoodListing = require('../models/FoodListing');

// @desc    Submit a pickup request for a listing
// @route   POST /api/requests
// @access  Private (NGO only)
exports.createRequest = async (req, res, next) => {
  try {
    const { listingId, message } = req.body;

    if (!listingId) {
      return res.status(400).json({
        success: false,
        message: 'Listing ID is required.',
        data: null,
      });
    }

    const listing = await FoodListing.findById(listingId);
    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Food listing not found.',
        data: null,
      });
    }

    if (listing.status !== 'available' && listing.status !== 'requested') {
      return res.status(400).json({
        success: false,
        message: `Listing is currently ${listing.status} and cannot be requested.`,
        data: null,
      });
    }

    if (new Date(listing.expiryDate) <= new Date()) {
      listing.status = 'expired';
      await listing.save();
      return res.status(400).json({
        success: false,
        message: 'This food listing has already expired.',
        data: null,
      });
    }

    // Check duplicate request
    const existing = await PickupRequest.findOne({
      listing: listingId,
      ngo: req.user.id,
      status: { $in: ['pending', 'accepted'] },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'You have already requested this listing.',
        data: null,
      });
    }

    const pickupRequest = await PickupRequest.create({
      listing: listing._id,
      ngo: req.user.id,
      donor: listing.donor,
      message: message || '',
      status: 'pending',
    });

    // Mark listing as requested if currently available
    if (listing.status === 'available') {
      listing.status = 'requested';
      await listing.save();
    }

    res.status(201).json({
      success: true,
      message: 'Pickup request submitted successfully.',
      data: pickupRequest,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get NGO's own requests
// @route   GET /api/requests/my
// @access  Private (NGO only)
exports.getMyRequests = async (req, res, next) => {
  try {
    const requests = await PickupRequest.find({ ngo: req.user.id })
      .populate('listing')
      .populate('donor', 'name email phone address')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      message: 'NGO requests retrieved.',
      data: requests,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get incoming requests on donor's listings
// @route   GET /api/requests/incoming
// @access  Private (Donor only)
exports.getIncomingRequests = async (req, res, next) => {
  try {
    const requests = await PickupRequest.find({ donor: req.user.id })
      .populate('listing')
      .populate('ngo', 'name organizationName registrationNumber phone address email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      message: 'Incoming requests retrieved.',
      data: requests,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Donor accepts a pickup request
// @route   PUT /api/requests/:id/accept
// @access  Private (Donor only)
exports.acceptRequest = async (req, res, next) => {
  try {
    const request = await PickupRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found.',
        data: null,
      });
    }

    if (request.donor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only accept requests on your own food listings.',
        data: null,
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Request is already ${request.status}.`,
        data: null,
      });
    }

    const listing = await FoodListing.findById(request.listing);
    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Associated listing not found.',
        data: null,
      });
    }

    if (listing.status === 'claimed' || listing.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'This listing has already been claimed or completed.',
        data: null,
      });
    }

    // Accept this request
    request.status = 'accepted';
    await request.save();

    // Mark listing claimed
    listing.status = 'claimed';
    listing.claimedBy = request.ngo;
    await listing.save();

    // Auto-reject other pending requests for this listing
    await PickupRequest.updateMany(
      { listing: listing._id, _id: { $ne: request._id }, status: 'pending' },
      { $set: { status: 'rejected' } }
    );

    res.json({
      success: true,
      message: 'Request accepted. The listing is now claimed and contact details are available.',
      data: {
        request,
        listing,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Donor rejects a pickup request
// @route   PUT /api/requests/:id/reject
// @access  Private (Donor only)
exports.rejectRequest = async (req, res, next) => {
  try {
    const request = await PickupRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found.',
        data: null,
      });
    }

    if (request.donor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only reject requests on your own food listings.',
        data: null,
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Request is already ${request.status}.`,
        data: null,
      });
    }

    request.status = 'rejected';
    await request.save();

    // Revert listing to available if no other pending requests
    const remainingPending = await PickupRequest.countDocuments({
      listing: request.listing,
      status: 'pending',
    });

    if (remainingPending === 0) {
      await FoodListing.findByIdAndUpdate(request.listing, { status: 'available' });
    }

    res.json({
      success: true,
      message: 'Request rejected.',
      data: request,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    NGO cancels own pending request
// @route   PUT /api/requests/:id/cancel
// @access  Private (NGO only)
exports.cancelRequest = async (req, res, next) => {
  try {
    const request = await PickupRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found.',
        data: null,
      });
    }

    if (request.ngo.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only cancel your own requests.',
        data: null,
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending requests can be cancelled.',
        data: null,
      });
    }

    request.status = 'cancelled';
    await request.save();

    const remainingPending = await PickupRequest.countDocuments({
      listing: request.listing,
      status: 'pending',
    });

    if (remainingPending === 0) {
      await FoodListing.findByIdAndUpdate(request.listing, { status: 'available' });
    }

    res.json({
      success: true,
      message: 'Request cancelled successfully.',
      data: request,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Donor marks pickup as completed
// @route   PUT /api/requests/:id/complete
// @access  Private (Donor only)
exports.completeRequest = async (req, res, next) => {
  try {
    const request = await PickupRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found.',
        data: null,
      });
    }

    if (request.donor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to complete this request.',
        data: null,
      });
    }

    if (request.status !== 'accepted') {
      return res.status(400).json({
        success: false,
        message: 'Only accepted requests can be marked as completed.',
        data: null,
      });
    }

    request.status = 'completed';
    await request.save();

    await FoodListing.findByIdAndUpdate(request.listing, { status: 'completed' });

    res.json({
      success: true,
      message: 'Pickup marked as successfully completed.',
      data: request,
    });
  } catch (error) {
    next(error);
  }
};
