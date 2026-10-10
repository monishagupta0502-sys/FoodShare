const cron = require('node-cron');
const FoodListing = require('../models/FoodListing');

/**
 * Scheduled job running every 15 minutes to mark past-expiry listings as "expired"
 */
const initExpiryJob = () => {
  // Runs every 15 minutes: */15 * * * *
  cron.schedule('*/15 * * * *', async () => {
    try {
      const now = new Date();
      const result = await FoodListing.updateMany(
        {
          status: 'available',
          expiryDate: { $lte: now },
        },
        {
          $set: { status: 'expired' },
        }
      );
      if (result.modifiedCount > 0) {
        console.log(`[Expiry Cron Job] Marked ${result.modifiedCount} listing(s) as expired at ${now.toISOString()}`);
      }
    } catch (err) {
      console.error('[Expiry Cron Job Error]:', err.message);
    }
  });

  console.log('[Expiry Cron Job] Scheduled to run every 15 minutes.');
};

module.exports = initExpiryJob;
