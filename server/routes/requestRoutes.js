const express = require('express');
const { check } = require('express-validator');
const {
  createRequest,
  getMyRequests,
  getIncomingRequests,
  acceptRequest,
  rejectRequest,
  cancelRequest,
  completeRequest,
} = require('../controllers/requestController');
const protect = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');
const validate = require('../middleware/validateMiddleware');

const router = express.Router();

router.post(
  '/',
  protect,
  authorize('ngo'),
  [check('listingId', 'Listing ID is required').notEmpty(), validate],
  createRequest
);

router.get('/my', protect, authorize('ngo'), getMyRequests);
router.get('/incoming', protect, authorize('donor'), getIncomingRequests);

router.put('/:id/accept', protect, authorize('donor'), acceptRequest);
router.put('/:id/reject', protect, authorize('donor'), rejectRequest);
router.put('/:id/cancel', protect, authorize('ngo'), cancelRequest);
router.put('/:id/complete', protect, authorize('donor'), completeRequest);

module.exports = router;
