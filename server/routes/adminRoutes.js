const express = require('express');
const {
  getPlatformStats,
  getAllUsers,
  toggleUserStatus,
  deleteUser,
  getAllListings,
  deleteListingByAdmin,
} = require('../controllers/adminController');
const protect = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

const router = express.Router();

// Apply protect and admin role middleware to all admin routes
router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getPlatformStats);
router.get('/users', getAllUsers);
router.put('/users/:id/toggle', toggleUserStatus);
router.delete('/users/:id', deleteUser);

router.get('/listings', getAllListings);
router.delete('/listings/:id', deleteListingByAdmin);

module.exports = router;
