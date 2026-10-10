const FoodListing = require('../models/FoodListing');
const PickupRequest = require('../models/PickupRequest');

// @desc    Create new food listing
// @route   POST /api/food
// @access  Private (Donor only)
exports.createFood = async (req, res, next) => {
  try {
    const {
      title,
      description,
      foodType,
      quantity,
      unit,
      pickupLocation,
      availableFrom,
      expiryDate,
      imageUrl,
      contactPhone,
    } = req.body;

    const foodListing = await FoodListing.create({
      title,
      description,
      foodType,
      quantity,
      unit,
      pickupLocation,
      availableFrom,
      expiryDate,
      donor: req.user.id,
      imageUrl: imageUrl || '',
      contactPhone: contactPhone || req.user.phone || '',
    });

    res.status(201).json({
      success: true,
      message: 'Food listing created successfully.',
      data: foodListing,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get food listings with search, filter, sort & pagination
// @route   GET /api/food
// @access  Private
exports.getFoodListings = async (req, res, next) => {
  try {
    const {
      search,
      foodType,
      city,
      status,
      sortBy = 'expiryDate',
      order = 'asc',
      page = 1,
      limit = 12,
    } = req.query;

    const query = {};

    // By default, if NGO is browsing and no status is given, show available only
    if (status && status !== 'all') {
      query.status = status;
    } else if (!status && req.user.role === 'ngo') {
      query.status = 'available';
    }

    // Text search on title or description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'pickupLocation.city': { $regex: search, $options: 'i' } },
      ];
    }

    if (foodType && foodType !== 'all') {
      query.foodType = foodType;
    }

    if (city && city !== 'all') {
      query['pickupLocation.city'] = { $regex: new RegExp(`^${city}$`, 'i') };
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 12;
    const skip = (pageNum - 1) * limitNum;
    const sortOrder = order === 'desc' ? -1 : 1;

    const total = await FoodListing.countDocuments(query);
    const listings = await FoodListing.find(query)
      .populate('donor', 'name email phone address')
      .populate('claimedBy', 'name organizationName phone')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      message: 'Listings retrieved successfully.',
      data: {
        listings,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get donor's own listings
// @route   GET /api/food/my
// @access  Private (Donor only)
exports.getMyListings = async (req, res, next) => {
  try {
    const listings = await FoodListing.find({ donor: req.user.id })
      .populate('claimedBy', 'name organizationName phone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      message: 'Own food listings retrieved.',
      data: listings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single food listing
// @route   GET /api/food/:id
// @access  Private
exports.getFoodById = async (req, res, next) => {
  try {
    const listing = await FoodListing.findById(req.params.id)
      .populate('donor', 'name email phone address')
      .populate('claimedBy', 'name organizationName phone');

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Food listing not found.',
        data: null,
      });
    }

    const isDonorOrAdmin = req.user.role === 'admin' || req.user.id === listing.donor._id.toString();

    // Check if current NGO has an accepted pickup request
    let isAcceptedNgo = false;
    if (req.user.role === 'ngo') {
      const acceptedReq = await PickupRequest.findOne({
        listing: listing._id,
        ngo: req.user.id,
        status: { $in: ['accepted', 'completed'] },
      });
      if (acceptedReq) isAcceptedNgo = true;
    }

    const listingObj = listing.toObject();
    if (!isDonorOrAdmin && !isAcceptedNgo) {
      listingObj.contactPhone = 'Visible upon request acceptance';
    }

    res.json({
      success: true,
      message: 'Food listing details.',
      data: listingObj,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update food listing
// @route   PUT /api/food/:id
// @access  Private (Donor only)
exports.updateFood = async (req, res, next) => {
  try {
    const listing = await FoodListing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Food listing not found.',
        data: null,
      });
    }

    if (listing.donor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this listing.',
        data: null,
      });
    }

    if (listing.status !== 'available') {
      return res.status(400).json({
        success: false,
        message: 'Only listings with status "available" can be modified.',
        data: null,
      });
    }

    const allowedFields = [
      'title',
      'description',
      'foodType',
      'quantity',
      'unit',
      'pickupLocation',
      'availableFrom',
      'expiryDate',
      'imageUrl',
      'contactPhone',
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        listing[field] = req.body[field];
      }
    });

    await listing.save();

    res.json({
      success: true,
      message: 'Food listing updated successfully.',
      data: listing,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete food listing
// @route   DELETE /api/food/:id
// @access  Private (Owner Donor or Admin)
exports.deleteFood = async (req, res, next) => {
  try {
    const listing = await FoodListing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Food listing not found.',
        data: null,
      });
    }

    const isOwner = listing.donor.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this listing.',
        data: null,
      });
    }

    // Cancel any pending requests on this listing
    await PickupRequest.updateMany(
      { listing: listing._id, status: 'pending' },
      { $set: { status: 'cancelled' } }
    );

    await listing.deleteOne();

    res.json({
      success: true,
      message: 'Listing removed and associated pending requests cancelled.',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get donor dashboard statistics
// @route   GET /api/food/stats/donor
// @access  Private (Donor only)
exports.getDonorStats = async (req, res, next) => {
  try {
    const donorId = req.user.id;

    const [total, available, requested, claimed, completed, expired] = await Promise.all([
      FoodListing.countDocuments({ donor: donorId }),
      FoodListing.countDocuments({ donor: donorId, status: 'available' }),
      FoodListing.countDocuments({ donor: donorId, status: 'requested' }),
      FoodListing.countDocuments({ donor: donorId, status: 'claimed' }),
      FoodListing.countDocuments({ donor: donorId, status: 'completed' }),
      FoodListing.countDocuments({ donor: donorId, status: 'expired' }),
    ]);

    const completedListings = await FoodListing.find({ donor: donorId, status: 'completed' });
    const totalMealsDonated = completedListings.reduce((sum, item) => sum + item.quantity, 0);

    res.json({
      success: true,
      message: 'Donor statistics fetched.',
      data: {
        total,
        available,
        requested,
        claimed,
        completed,
        expired,
        totalMealsDonated,
      },
    });
  } catch (error) {
    next(error);
  }
};
