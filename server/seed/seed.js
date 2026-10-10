const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config({ path: '../.env' });

const User = require('../models/User');
const FoodListing = require('../models/FoodListing');
const PickupRequest = require('../models/PickupRequest');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/foodshare';
    await mongoose.connect(mongoUri);
    console.log('[Seed] Connected to MongoDB at', mongoUri);

    // Clear existing collections
    await User.deleteMany({});
    await FoodListing.deleteMany({});
    await PickupRequest.deleteMany({});
    console.log('[Seed] Cleared existing Users, FoodListings, and PickupRequests.');

    // 1. Create Users
    const salt = await bcrypt.genSalt(10);
    const hash = async (pwd) => bcrypt.hash(pwd, salt);

    const admin = await User.create({
      name: 'Super Admin',
      email: 'admin@foodshare.org',
      password: await hash('admin123'),
      role: 'admin',
      phone: '+91 99000 00001',
      address: 'FoodShare HQ, Innovation Hub, Mumbai',
      isActive: true,
    });

    const donorDirect = await User.create({
      name: 'FoodShare Partner Kitchen',
      email: 'donor@foodshare.org',
      password: await hash('donor123'),
      role: 'donor',
      phone: '+91 98765 00002',
      address: 'Central Kitchen & Banquet Hall, Mumbai',
      isActive: true,
    });

    const ngoDirect = await User.create({
      name: 'Food Relief Foundation',
      email: 'ngo@foodshare.org',
      password: await hash('ngo123'),
      role: 'ngo',
      phone: '+91 98765 00003',
      address: 'Community Relief Center, Mumbai',
      organizationName: 'Food Relief & Shelter Trust',
      registrationNumber: 'NGO-FS-2024-9901',
      isActive: true,
    });

    const donor1 = await User.create({
      name: 'The Grand Taj Hotel & Banquets',
      email: 'taj@culinary.com',
      password: await hash('donor123'),
      role: 'donor',
      phone: '+91 98765 43210',
      address: '42 Heritage Boulevard, Bandra West, Mumbai',
      isActive: true,
    });

    const donor2 = await User.create({
      name: 'Greenleaf Organic Cafe & Bakery',
      email: 'greenleaf@bistro.com',
      password: await hash('donor123'),
      role: 'donor',
      phone: '+91 98220 11223',
      address: '14 Indiranagar 100ft Road, Bangalore',
      isActive: true,
    });

    const donor3 = await User.create({
      name: 'Sunshine Artisan Bakers',
      email: 'freshbakes@bakery.com',
      password: await hash('donor123'),
      role: 'donor',
      phone: '+91 97110 55667',
      address: '88 Connaught Place, New Delhi',
      isActive: true,
    });

    const ngo1 = await User.create({
      name: 'Anita Sharma',
      email: 'care@annakshetra.org',
      password: await hash('ngo123'),
      role: 'ngo',
      phone: '+91 98330 99881',
      address: '12 Wadala West, Mumbai',
      organizationName: 'Annakshetra Foundation',
      registrationNumber: 'NGO-MH-2019-8831',
      isActive: true,
    });

    const ngo2 = await User.create({
      name: 'Vikram Menon',
      email: 'feed@robinhood.org',
      password: await hash('ngo123'),
      role: 'ngo',
      phone: '+91 98450 77123',
      address: '75 Koramangala 4th Block, Bangalore',
      organizationName: 'Robin Food Rescue Network',
      registrationNumber: 'NGO-KA-2021-4412',
      isActive: true,
    });

    const ngo3 = await User.create({
      name: 'Pooja Roy',
      email: 'hope@shantibhavan.org',
      password: await hash('ngo123'),
      role: 'ngo',
      phone: '+91 98100 23456',
      address: '23 Lajpat Nagar III, New Delhi',
      organizationName: 'Shanti Bhavan Child Care Trust',
      registrationNumber: 'NGO-DL-2018-1209',
      isActive: true,
    });

    console.log('[Seed] Created 7 users: 1 Admin, 3 Donors, 3 NGOs.');

    // 2. Create 15 Food Listings
    const now = new Date();
    const hoursFromNow = (h) => new Date(now.getTime() + h * 60 * 60 * 1000);
    const daysFromNow = (d) => new Date(now.getTime() + d * 24 * 60 * 60 * 1000);
    const daysAgo = (d) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000);

    const defaultImg = '/src/assets/images/foodshare_hero_community_1791608388536.jpg';

    const listingsData = [
      {
        title: 'Fresh Royal Vegetable Biryani & Raita',
        description: 'Prepared for evening luxury buffet, untouched and stored in commercial insulated warmers.',
        foodType: 'veg',
        quantity: 85,
        unit: 'plates',
        pickupLocation: { address: '42 Heritage Boulevard, Bandra West', city: 'Mumbai', pincode: '400050' },
        availableFrom: now,
        expiryDate: hoursFromNow(8),
        donor: donor1._id,
        status: 'available',
        imageUrl: defaultImg,
        contactPhone: '+91 98765 43210',
      },
      {
        title: 'Assorted Sourdough Loaves & Croissants',
        description: 'Freshly baked morning sourdough loaves, multigrain bread, and butter croissants.',
        foodType: 'bakery',
        quantity: 45,
        unit: 'items',
        pickupLocation: { address: '14 Indiranagar 100ft Road', city: 'Bangalore', pincode: '560038' },
        availableFrom: now,
        expiryDate: hoursFromNow(14),
        donor: donor2._id,
        status: 'available',
        imageUrl: defaultImg,
        contactPhone: '+91 98220 11223',
      },
      {
        title: 'Hearty Dal Makhani & Jeera Rice Trays',
        description: 'Nutritious slow-cooked black lentils with aromatic cumin basmati rice in food-grade trays.',
        foodType: 'veg',
        quantity: 30,
        unit: 'kg',
        pickupLocation: { address: '88 Connaught Place', city: 'New Delhi', pincode: '110001' },
        availableFrom: now,
        expiryDate: hoursFromNow(12),
        donor: donor3._id,
        status: 'available',
        imageUrl: defaultImg,
        contactPhone: '+91 97110 55667',
      },
      {
        title: 'High-Protein Chickpea & Roasted Vegetable Bowls',
        description: 'Vegan salad and warm quinoa bowls with Mediterranean dressing.',
        foodType: 'vegan',
        quantity: 50,
        unit: 'plates',
        pickupLocation: { address: '14 Indiranagar 100ft Road', city: 'Bangalore', pincode: '560038' },
        availableFrom: now,
        expiryDate: hoursFromNow(6),
        donor: donor2._id,
        status: 'available',
        imageUrl: defaultImg,
        contactPhone: '+91 98220 11223',
      },
      {
        title: 'Sealed Whole Grain Biscuits & Fruit Nut Bars',
        description: 'Commercial packaged snacks from event catering. Unopened manufacturer boxes.',
        foodType: 'packaged',
        quantity: 120,
        unit: 'packets',
        pickupLocation: { address: '42 Heritage Boulevard, Bandra West', city: 'Mumbai', pincode: '400050' },
        availableFrom: now,
        expiryDate: daysFromNow(10),
        donor: donor1._id,
        status: 'available',
        imageUrl: defaultImg,
        contactPhone: '+91 98765 43210',
      },
      {
        title: 'Tandoori Chicken Curry with Fresh Roti',
        description: 'Prepared in certified commercial kitchen for corporate gala with temperature logs.',
        foodType: 'non-veg',
        quantity: 60,
        unit: 'plates',
        pickupLocation: { address: '88 Connaught Place', city: 'New Delhi', pincode: '110001' },
        availableFrom: now,
        expiryDate: hoursFromNow(5),
        donor: donor3._id,
        status: 'available',
        imageUrl: defaultImg,
        contactPhone: '+91 97110 55667',
      },
      {
        title: 'Freshly Squeezed Citrus & Tropical Juices',
        description: 'Cold-pressed orange, sweet lime, and watermelon juice in sealed 1-liter glass bottles.',
        foodType: 'other',
        quantity: 25,
        unit: 'liters',
        pickupLocation: { address: '14 Indiranagar 100ft Road', city: 'Bangalore', pincode: '560038' },
        availableFrom: now,
        expiryDate: hoursFromNow(16),
        donor: donor2._id,
        status: 'available',
        imageUrl: defaultImg,
        contactPhone: '+91 98220 11223',
      },
      {
        title: 'Paneer Butter Masala with Steamed Rice',
        description: 'Catered lunch surplus from conference hall. Packed in 4 insulated warm containers.',
        foodType: 'veg',
        quantity: 40,
        unit: 'plates',
        pickupLocation: { address: '42 Heritage Boulevard, Bandra West', city: 'Mumbai', pincode: '400050' },
        availableFrom: now,
        expiryDate: hoursFromNow(7),
        donor: donor1._id,
        status: 'requested',
        imageUrl: defaultImg,
        contactPhone: '+91 98765 43210',
      },
      {
        title: 'Fresh Brioche Buns & Baguettes',
        description: 'Surplus baking batch from afternoon run. Perfect for shelter distribution.',
        foodType: 'bakery',
        quantity: 75,
        unit: 'items',
        pickupLocation: { address: '88 Connaught Place', city: 'New Delhi', pincode: '110001' },
        availableFrom: now,
        expiryDate: hoursFromNow(9),
        donor: donor3._id,
        status: 'requested',
        imageUrl: defaultImg,
        contactPhone: '+91 97110 55667',
      },
      {
        title: 'South Indian Sambar, Idli & Chutney Kit',
        description: 'Steamed idlis with rich vegetable sambar. Preserved fresh.',
        foodType: 'veg',
        quantity: 100,
        unit: 'plates',
        pickupLocation: { address: '14 Indiranagar 100ft Road', city: 'Bangalore', pincode: '560038' },
        availableFrom: hoursFromNow(-2),
        expiryDate: hoursFromNow(10),
        donor: donor2._id,
        status: 'claimed',
        claimedBy: ngo2._id,
        imageUrl: defaultImg,
        contactPhone: '+91 98220 11223',
      },
      {
        title: 'Mutton Dum Biryani with Boiled Eggs',
        description: 'Wedding reception surplus prepared under executive chef supervision. Stored at 3°C.',
        foodType: 'non-veg',
        quantity: 70,
        unit: 'plates',
        pickupLocation: { address: '42 Heritage Boulevard, Bandra West', city: 'Mumbai', pincode: '400050' },
        availableFrom: hoursFromNow(-3),
        expiryDate: hoursFromNow(6),
        donor: donor1._id,
        status: 'claimed',
        claimedBy: ngo1._id,
        imageUrl: defaultImg,
        contactPhone: '+91 98765 43210',
      },
      {
        title: 'Steamed Brown Rice and Lentil Stew',
        description: 'Wholesome organic stew prepared with farm vegetables. Vegan certified.',
        foodType: 'vegan',
        quantity: 35,
        unit: 'kg',
        pickupLocation: { address: '88 Connaught Place', city: 'New Delhi', pincode: '110001' },
        availableFrom: hoursFromNow(-4),
        expiryDate: hoursFromNow(4),
        donor: donor3._id,
        status: 'claimed',
        claimedBy: ngo3._id,
        imageUrl: defaultImg,
        contactPhone: '+91 97110 55667',
      },
      {
        title: 'Mixed Vegetable Pulao with Curry',
        description: 'Successfully distributed to 120 residents at Dharavi Community Shelter.',
        foodType: 'veg',
        quantity: 120,
        unit: 'plates',
        pickupLocation: { address: '42 Heritage Boulevard, Bandra West', city: 'Mumbai', pincode: '400050' },
        availableFrom: daysAgo(4),
        expiryDate: daysAgo(3),
        donor: donor1._id,
        status: 'completed',
        claimedBy: ngo1._id,
        imageUrl: defaultImg,
        contactPhone: '+91 98765 43210',
      },
      {
        title: 'Artisan Pastries and Banana Loaves',
        description: 'Distributed to evening children study center by Robin Food Rescue Network.',
        foodType: 'bakery',
        quantity: 60,
        unit: 'items',
        pickupLocation: { address: '14 Indiranagar 100ft Road', city: 'Bangalore', pincode: '560038' },
        availableFrom: daysAgo(6),
        expiryDate: daysAgo(5),
        donor: donor2._id,
        status: 'completed',
        claimedBy: ngo2._id,
        imageUrl: defaultImg,
        contactPhone: '+91 98220 11223',
      },
      {
        title: 'Fresh Garden Salad Bowls with Citrus Vinaigrette',
        description: 'Leafy greens and raw salads. Expiry elapsed before volunteer pickup.',
        foodType: 'vegan',
        quantity: 20,
        unit: 'plates',
        pickupLocation: { address: '88 Connaught Place', city: 'New Delhi', pincode: '110001' },
        availableFrom: daysAgo(4),
        expiryDate: daysAgo(2),
        donor: donor3._id,
        status: 'expired',
        imageUrl: defaultImg,
        contactPhone: '+91 97110 55667',
      },
    ];

    const createdListings = await FoodListing.insertMany(listingsData);
    console.log('[Seed] Created 15 Food Listings across Mumbai, Bangalore, New Delhi.');

    // 3. Create Sample Pickup Requests
    await PickupRequest.create([
      {
        listing: createdListings[7]._id, // Paneer Butter Masala (requested)
        ngo: ngo1._id,
        donor: donor1._id,
        message: 'We have an insulated van in Bandra West available to collect this food within 45 minutes.',
        status: 'pending',
      },
      {
        listing: createdListings[8]._id, // Brioche Buns (requested)
        ngo: ngo3._id,
        donor: donor3._id,
        message: 'Shanti Bhavan volunteers are ready to pick up these fresh baguettes for dinner distribution.',
        status: 'pending',
      },
      {
        listing: createdListings[9]._id, // Sambar Kit (claimed)
        ngo: ngo2._id,
        donor: donor2._id,
        message: 'Robin Food Rescue van en-route to Indiranagar for the South Indian meal batch.',
        status: 'accepted',
      },
      {
        listing: createdListings[10]._id, // Mutton Dum Biryani (claimed)
        ngo: ngo1._id,
        donor: donor1._id,
        message: 'Annakshetra team confirmed pickup scheduled for 2:00 PM.',
        status: 'accepted',
      },
      {
        listing: createdListings[11]._id, // Brown Rice (claimed)
        ngo: ngo3._id,
        donor: donor3._id,
        message: 'Volunteers arriving at Connaught Place location at 3:30 PM.',
        status: 'accepted',
      },
      {
        listing: createdListings[12]._id, // Pulao (completed)
        ngo: ngo1._id,
        donor: donor1._id,
        message: 'Successfully picked up and distributed to Dharavi center.',
        status: 'completed',
      },
    ]);

    console.log('[Seed] Created 6 sample Pickup Requests.');
    console.log('[Seed] Database seeding completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seedData();
