const express = require('express');
const { check } = require('express-validator');
const {
  createFood,
  getFoodListings,
  getMyListings,
  getFoodById,
  updateFood,
  deleteFood,
  getDonorStats,
} = require('../controllers/foodController');
const protect = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');
const validate = require('../middleware/validateMiddleware');

const router = express.Router();

// Specific routes first to prevent collision with :id
router.get('/stats/donor', protect, authorize('donor'), getDonorStats);
router.get('/my', protect, authorize('donor'), getMyListings);

router
  .route('/')
  .post(
    protect,
    authorize('donor'),
    [
      check('title', 'Food title is required').notEmpty().trim(),
      check('quantity', 'Quantity must be at least 1').isInt({ min: 1 }),
      check('unit', 'Invalid unit').isIn(['plates', 'kg', 'packets', 'liters', 'items']),
      check('pickupLocation.address', 'Pickup street address is required').notEmpty(),
      check('pickupLocation.city', 'Pickup city is required').notEmpty(),
      check('availableFrom', 'Available from date is required').isISO8601(),
      check('expiryDate', 'Expiry date is required').isISO8601(),
      validate,
    ],
    createFood
  )
  .get(protect, getFoodListings);

router
  .route('/:id')
  .get(protect, getFoodById)
  .put(protect, authorize('donor'), updateFood)
  .delete(protect, deleteFood);

module.exports = router;
