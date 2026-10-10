const User = require('../models/User');
const FoodListing = require('../models/FoodListing');
const PickupRequest = require('../models/PickupRequest');

// @desc    Get platform-wide statistics
// @route   GET /api/admin/stats
// @access  Private (Admin only)
exports.getPlatformStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      donorsCount,
      ngosCount,
      adminsCount,
      activeUsers,
      totalListings,
      availableListings,
      requestedListings,
      claimedListings,
      completedListings,
      expiredListings,
      completedMealsData,
      totalRequests,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'donor' }),
      User.countDocuments({ role: 'ngo' }),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ isActive: true }),
      FoodListing.countDocuments(),
      FoodListing.countDocuments({ status: 'available' }),
      FoodListing.countDocuments({ status: 'requested' }),
      FoodListing.countDocuments({ status: 'claimed' }),
      FoodListing.countDocuments({ status: 'completed' }),
      FoodListing.countDocuments({ status: 'expired' }),
      FoodListing.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$quantity' } } },
      ]),
      PickupRequest.countDocuments(),
    ]);

    const totalMealsDonated = completedMealsData[0] ? completedMealsData[0].total : 0;

    res.json({
      success: true,
      message: 'Platform statistics retrieved.',
      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
          byRole: {
            donor: donorsCount,
            ngo: ngosCount,
            admin: adminsCount,
          },
        },
        listings: {
          total: totalListings,
          available: availableListings,
          requested: requestedListings,
          claimed: claimedListings,
          completed: completedListings,
          expired: expiredListings,
        },
        totalMealsDonated,
        totalRequests,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users with optional role filtering
// @route   GET /api/admin/users
// @access  Private (Admin only)
exports.getAllUsers = async (req, res, next) => {
  try {
    const { role } = req.query;
    const query = {};
    if (role && role !== 'all') {
      query.role = role;
    }

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });

    res.json({
      success: true,
      message: 'All users retrieved.',
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle activate/deactivate user
// @route   PUT /api/admin/users/:id/toggle
// @access  Private (Admin only)
exports.toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
        data: null,
      });
    }

    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Admin cannot deactivate their own account.',
        data: null,
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully.`,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin only)
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
        data: null,
      });
    }

    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Admin cannot delete their own account.',
        data: null,
      });
    }

    await user.deleteOne();

    res.json({
      success: true,
      message: 'User deleted successfully.',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all listings platform-wide
// @route   GET /api/admin/listings
// @access  Private (Admin only)
exports.getAllListings = async (req, res, next) => {
  try {
    const listings = await FoodListing.find()
      .populate('donor', 'name email phone address')
      .populate('claimedBy', 'name organizationName phone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      message: 'All platform listings retrieved.',
      data: listings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete any listing
// @route   DELETE /api/admin/listings/:id
// @access  Private (Admin only)
exports.deleteListingByAdmin = async (req, res, next) => {
  try {
    const listing = await FoodListing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found.',
        data: null,
      });
    }

    // Cancel pending requests
    await PickupRequest.updateMany(
      { listing: listing._id, status: 'pending' },
      { $set: { status: 'cancelled' } }
    );

    await listing.deleteOne();

    res.json({
      success: true,
      message: 'Listing permanently removed by admin.',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};
