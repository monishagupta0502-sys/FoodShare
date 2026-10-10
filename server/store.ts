import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const JWT_SECRET = process.env.JWT_SECRET || 'foodshare_dev_jwt_secret_key_2026';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  password?: string;
  role: 'donor' | 'ngo' | 'admin';
  phone: string;
  address: string;
  organizationName?: string;
  registrationNumber?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IFoodListing {
  _id: string;
  title: string;
  description: string;
  foodType: 'veg' | 'non-veg' | 'vegan' | 'bakery' | 'packaged' | 'other';
  quantity: number;
  unit: 'plates' | 'kg' | 'packets' | 'liters' | 'items';
  pickupLocation: {
    address: string;
    city: string;
    pincode: string;
  };
  availableFrom: string;
  expiryDate: string;
  donor: string | IUser;
  status: 'available' | 'requested' | 'claimed' | 'completed' | 'expired' | 'cancelled';
  claimedBy: string | IUser | null;
  imageUrl?: string;
  contactPhone: string;
  createdAt: string;
  updatedAt: string;
}

export interface IPickupRequest {
  _id: string;
  listing: string | IFoodListing;
  ngo: string | IUser;
  donor: string | IUser;
  message: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'completed';
  createdAt: string;
  updatedAt: string;
}

// In-memory data store with reactive state and seed initialization
class DatabaseStore {
  users: IUser[] = [];
  listings: IFoodListing[] = [];
  requests: IPickupRequest[] = [];
  private initialized = false;

  constructor() {
    this.init();
  }

  async init() {
    if (this.initialized) return;

    const salt = await bcrypt.genSalt(10);
    const hash = async (pwd: string) => bcrypt.hash(pwd, salt);

    const now = new Date();
    const isoHoursFromNow = (h: number) => new Date(now.getTime() + h * 60 * 60 * 1000).toISOString();
    const isoDaysFromNow = (d: number) => new Date(now.getTime() + d * 24 * 60 * 60 * 1000).toISOString();
    const isoDaysAgo = (d: number) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000).toISOString();

    const heroImg = '/src/assets/images/foodshare_hero_community_1791608388536.jpg';

    // 1. Seed Users
    const uAdmin: IUser = {
      _id: 'usr_admin_01',
      name: 'Super Admin',
      email: 'admin@foodshare.org',
      password: await hash('admin123'),
      role: 'admin',
      phone: '+91 99000 00001',
      address: 'FoodShare HQ, Innovation Hub, Mumbai',
      isActive: true,
      createdAt: isoDaysAgo(30),
      updatedAt: isoDaysAgo(30),
    };

    const uDonor1: IUser = {
      _id: 'usr_donor_01',
      name: 'The Grand Taj Hotel & Banquets',
      email: 'taj@culinary.com',
      password: await hash('donor123'),
      role: 'donor',
      phone: '+91 98765 43210',
      address: '42 Heritage Boulevard, Bandra West, Mumbai',
      isActive: true,
      createdAt: isoDaysAgo(25),
      updatedAt: isoDaysAgo(25),
    };

    const uDonor2: IUser = {
      _id: 'usr_donor_02',
      name: 'Greenleaf Organic Cafe & Bakery',
      email: 'greenleaf@bistro.com',
      password: await hash('donor123'),
      role: 'donor',
      phone: '+91 98220 11223',
      address: '14 Indiranagar 100ft Road, Bangalore',
      isActive: true,
      createdAt: isoDaysAgo(20),
      updatedAt: isoDaysAgo(20),
    };

    const uDonor3: IUser = {
      _id: 'usr_donor_03',
      name: 'Sunshine Artisan Bakers',
      email: 'freshbakes@bakery.com',
      password: await hash('donor123'),
      role: 'donor',
      phone: '+91 97110 55667',
      address: '88 Connaught Place, New Delhi',
      isActive: true,
      createdAt: isoDaysAgo(15),
      updatedAt: isoDaysAgo(15),
    };

    const uNgo1: IUser = {
      _id: 'usr_ngo_01',
      name: 'Anita Sharma',
      email: 'care@annakshetra.org',
      password: await hash('ngo123'),
      role: 'ngo',
      phone: '+91 98330 99881',
      address: '12 Wadala West, Mumbai',
      organizationName: 'Annakshetra Foundation',
      registrationNumber: 'NGO-MH-2019-8831',
      isActive: true,
      createdAt: isoDaysAgo(28),
      updatedAt: isoDaysAgo(28),
    };

    const uNgo2: IUser = {
      _id: 'usr_ngo_02',
      name: 'Vikram Menon',
      email: 'feed@robinhood.org',
      password: await hash('ngo123'),
      role: 'ngo',
      phone: '+91 98450 77123',
      address: '75 Koramangala 4th Block, Bangalore',
      organizationName: 'Robin Food Rescue Network',
      registrationNumber: 'NGO-KA-2021-4412',
      isActive: true,
      createdAt: isoDaysAgo(22),
      updatedAt: isoDaysAgo(22),
    };

    const uNgo3: IUser = {
      _id: 'usr_ngo_03',
      name: 'Pooja Roy',
      email: 'hope@shantibhavan.org',
      password: await hash('ngo123'),
      role: 'ngo',
      phone: '+91 98100 23456',
      address: '23 Lajpat Nagar III, New Delhi',
      organizationName: 'Shanti Bhavan Child Care Trust',
      registrationNumber: 'NGO-DL-2018-1209',
      isActive: true,
      createdAt: isoDaysAgo(18),
      updatedAt: isoDaysAgo(18),
    };

    const uDonorDirect: IUser = {
      _id: 'usr_donor_direct',
      name: 'FoodShare Partner Kitchen',
      email: 'donor@foodshare.org',
      password: await hash('donor123'),
      role: 'donor',
      phone: '+91 98765 00002',
      address: 'Central Kitchen & Banquet Hall, Mumbai',
      isActive: true,
      createdAt: isoDaysAgo(30),
      updatedAt: isoDaysAgo(30),
    };

    const uNgoDirect: IUser = {
      _id: 'usr_ngo_direct',
      name: 'Food Relief Foundation',
      email: 'ngo@foodshare.org',
      password: await hash('ngo123'),
      role: 'ngo',
      phone: '+91 98765 00003',
      address: 'Community Relief Center, Mumbai',
      organizationName: 'Food Relief & Shelter Trust',
      registrationNumber: 'NGO-FS-2024-9901',
      isActive: true,
      createdAt: isoDaysAgo(30),
      updatedAt: isoDaysAgo(30),
    };

    this.users = [uAdmin, uDonorDirect, uNgoDirect, uDonor1, uDonor2, uDonor3, uNgo1, uNgo2, uNgo3];

    // 2. Seed 15 Food Listings with varied statuses
    this.listings = [
      {
        _id: 'food_01',
        title: 'Fresh Royal Vegetable Biryani & Raita',
        description: 'Prepared for evening luxury buffet, untouched and stored in commercial insulated warmers. Includes cumin raita and salan.',
        foodType: 'veg',
        quantity: 85,
        unit: 'plates',
        pickupLocation: {
          address: '42 Heritage Boulevard, Bandra West',
          city: 'Mumbai',
          pincode: '400050',
        },
        availableFrom: now.toISOString(),
        expiryDate: isoHoursFromNow(8),
        donor: uDonor1._id,
        status: 'available',
        claimedBy: null,
        imageUrl: heroImg,
        contactPhone: '+91 98765 43210',
        createdAt: isoDaysAgo(1),
        updatedAt: isoDaysAgo(1),
      },
      {
        _id: 'food_02',
        title: 'Assorted Sourdough Loaves & Croissants',
        description: 'Freshly baked morning sourdough loaves, multigrain bread, and butter croissants. Excellent condition.',
        foodType: 'bakery',
        quantity: 45,
        unit: 'items',
        pickupLocation: {
          address: '14 Indiranagar 100ft Road',
          city: 'Bangalore',
          pincode: '560038',
        },
        availableFrom: now.toISOString(),
        expiryDate: isoHoursFromNow(14),
        donor: uDonor2._id,
        status: 'available',
        claimedBy: null,
        imageUrl: heroImg,
        contactPhone: '+91 98220 11223',
        createdAt: isoDaysAgo(1),
        updatedAt: isoDaysAgo(1),
      },
      {
        _id: 'food_03',
        title: 'Hearty Dal Makhani & Jeera Rice Trays',
        description: 'Nutritious slow-cooked black lentils with aromatic cumin basmati rice. Vacuum packed in 5kg food-grade containers.',
        foodType: 'veg',
        quantity: 30,
        unit: 'kg',
        pickupLocation: {
          address: '88 Connaught Place',
          city: 'New Delhi',
          pincode: '110001',
        },
        availableFrom: now.toISOString(),
        expiryDate: isoHoursFromNow(12),
        donor: uDonor3._id,
        status: 'available',
        claimedBy: null,
        imageUrl: heroImg,
        contactPhone: '+91 97110 55667',
        createdAt: isoDaysAgo(1),
        updatedAt: isoDaysAgo(1),
      },
      {
        _id: 'food_04',
        title: 'High-Protein Chickpea & Roasted Vegetable Bowls',
        description: 'Vegan salad and warm quinoa bowls with Mediterranean dressing. Ideal for distribution to shelters.',
        foodType: 'vegan',
        quantity: 50,
        unit: 'plates',
        pickupLocation: {
          address: '14 Indiranagar 100ft Road',
          city: 'Bangalore',
          pincode: '560038',
        },
        availableFrom: now.toISOString(),
        expiryDate: isoHoursFromNow(6),
        donor: uDonor2._id,
        status: 'available',
        claimedBy: null,
        imageUrl: heroImg,
        contactPhone: '+91 98220 11223',
        createdAt: isoDaysAgo(2),
        updatedAt: isoDaysAgo(2),
      },
      {
        _id: 'food_05',
        title: 'Sealed Whole Grain Biscuits & Fruit Nut Bars',
        description: 'Commercial packaged snacks from event catering. Unopened manufacturer boxes with 6 months shelf life.',
        foodType: 'packaged',
        quantity: 120,
        unit: 'packets',
        pickupLocation: {
          address: '42 Heritage Boulevard, Bandra West',
          city: 'Mumbai',
          pincode: '400050',
        },
        availableFrom: now.toISOString(),
        expiryDate: isoDaysFromNow(10),
        donor: uDonor1._id,
        status: 'available',
        claimedBy: null,
        imageUrl: heroImg,
        contactPhone: '+91 98765 43210',
        createdAt: isoDaysAgo(2),
        updatedAt: isoDaysAgo(2),
      },
      {
        _id: 'food_06',
        title: 'Tandoori Chicken Curry with Fresh Roti',
        description: 'Prepared in certified commercial kitchen for corporate gala. Maintained under strict temperature log.',
        foodType: 'non-veg',
        quantity: 60,
        unit: 'plates',
        pickupLocation: {
          address: '88 Connaught Place',
          city: 'New Delhi',
          pincode: '110001',
        },
        availableFrom: now.toISOString(),
        expiryDate: isoHoursFromNow(5),
        donor: uDonor3._id,
        status: 'available',
        claimedBy: null,
        imageUrl: heroImg,
        contactPhone: '+91 97110 55667',
        createdAt: isoDaysAgo(1),
        updatedAt: isoDaysAgo(1),
      },
      {
        _id: 'food_07',
        title: 'Freshly Squeezed Citrus & Tropical Juices',
        description: 'Cold-pressed orange, sweet lime, and watermelon juice in sealed 1-liter glass bottles. Refrigerated.',
        foodType: 'other',
        quantity: 25,
        unit: 'liters',
        pickupLocation: {
          address: '14 Indiranagar 100ft Road',
          city: 'Bangalore',
          pincode: '560038',
        },
        availableFrom: now.toISOString(),
        expiryDate: isoHoursFromNow(16),
        donor: uDonor2._id,
        status: 'available',
        claimedBy: null,
        imageUrl: heroImg,
        contactPhone: '+91 98220 11223',
        createdAt: isoDaysAgo(1),
        updatedAt: isoDaysAgo(1),
      },
      {
        _id: 'food_08',
        title: 'Paneer Butter Masala with Steamed Rice',
        description: 'Catered lunch surplus from conference hall. Packed in 4 insulated warm containers.',
        foodType: 'veg',
        quantity: 40,
        unit: 'plates',
        pickupLocation: {
          address: '42 Heritage Boulevard, Bandra West',
          city: 'Mumbai',
          pincode: '400050',
        },
        availableFrom: now.toISOString(),
        expiryDate: isoHoursFromNow(7),
        donor: uDonor1._id,
        status: 'requested',
        claimedBy: null,
        imageUrl: heroImg,
        contactPhone: '+91 98765 43210',
        createdAt: isoDaysAgo(2),
        updatedAt: isoDaysAgo(1),
      },
      {
        _id: 'food_09',
        title: 'Fresh Brioche Buns & Baguettes',
        description: 'Surplus baking batch from afternoon run. Perfect for soup kitchens and day shelters.',
        foodType: 'bakery',
        quantity: 75,
        unit: 'items',
        pickupLocation: {
          address: '88 Connaught Place',
          city: 'New Delhi',
          pincode: '110001',
        },
        availableFrom: now.toISOString(),
        expiryDate: isoHoursFromNow(9),
        donor: uDonor3._id,
        status: 'requested',
        claimedBy: null,
        imageUrl: heroImg,
        contactPhone: '+91 97110 55667',
        createdAt: isoDaysAgo(2),
        updatedAt: isoDaysAgo(1),
      },
      {
        _id: 'food_10',
        title: 'South Indian Sambar, Idli & Chutney Kit',
        description: 'Steamed idlis (100 pieces) with thick vegetable sambar (15L). Freshly made this morning.',
        foodType: 'veg',
        quantity: 100,
        unit: 'plates',
        pickupLocation: {
          address: '14 Indiranagar 100ft Road',
          city: 'Bangalore',
          pincode: '560038',
        },
        availableFrom: isoHoursFromNow(-2),
        expiryDate: isoHoursFromNow(10),
        donor: uDonor2._id,
        status: 'claimed',
        claimedBy: uNgo2._id,
        imageUrl: heroImg,
        contactPhone: '+91 98220 11223',
        createdAt: isoDaysAgo(2),
        updatedAt: isoDaysAgo(1),
      },
      {
        _id: 'food_11',
        title: 'Mutton Dum Biryani with Boiled Eggs',
        description: 'Wedding reception surplus prepared under executive chef supervision. Preserved chilled at 3°C.',
        foodType: 'non-veg',
        quantity: 70,
        unit: 'plates',
        pickupLocation: {
          address: '42 Heritage Boulevard, Bandra West',
          city: 'Mumbai',
          pincode: '400050',
        },
        availableFrom: isoHoursFromNow(-3),
        expiryDate: isoHoursFromNow(6),
        donor: uDonor1._id,
        status: 'claimed',
        claimedBy: uNgo1._id,
        imageUrl: heroImg,
        contactPhone: '+91 98765 43210',
        createdAt: isoDaysAgo(2),
        updatedAt: isoDaysAgo(1),
      },
      {
        _id: 'food_12',
        title: 'Steamed Brown Rice and Lentil Stew',
        description: 'Wholesome organic stew prepared with farm vegetables. Vegan certified.',
        foodType: 'vegan',
        quantity: 35,
        unit: 'kg',
        pickupLocation: {
          address: '88 Connaught Place',
          city: 'New Delhi',
          pincode: '110001',
        },
        availableFrom: isoHoursFromNow(-4),
        expiryDate: isoHoursFromNow(4),
        donor: uDonor3._id,
        status: 'claimed',
        claimedBy: uNgo3._id,
        imageUrl: heroImg,
        contactPhone: '+91 97110 55667',
        createdAt: isoDaysAgo(3),
        updatedAt: isoDaysAgo(2),
      },
      {
        _id: 'food_13',
        title: 'Mixed Vegetable Pulao with Curry',
        description: 'Successfully distributed to 120 residents at Dharavi Community Shelter.',
        foodType: 'veg',
        quantity: 120,
        unit: 'plates',
        pickupLocation: {
          address: '42 Heritage Boulevard, Bandra West',
          city: 'Mumbai',
          pincode: '400050',
        },
        availableFrom: isoDaysAgo(4),
        expiryDate: isoDaysAgo(3),
        donor: uDonor1._id,
        status: 'completed',
        claimedBy: uNgo1._id,
        imageUrl: heroImg,
        contactPhone: '+91 98765 43210',
        createdAt: isoDaysAgo(5),
        updatedAt: isoDaysAgo(4),
      },
      {
        _id: 'food_14',
        title: 'Artisan Pastries and Banana Loaves',
        description: 'Distributed to evening children study center by Robin Food Rescue Network.',
        foodType: 'bakery',
        quantity: 60,
        unit: 'items',
        pickupLocation: {
          address: '14 Indiranagar 100ft Road',
          city: 'Bangalore',
          pincode: '560038',
        },
        availableFrom: isoDaysAgo(6),
        expiryDate: isoDaysAgo(5),
        donor: uDonor2._id,
        status: 'completed',
        claimedBy: uNgo2._id,
        imageUrl: heroImg,
        contactPhone: '+91 98220 11223',
        createdAt: isoDaysAgo(7),
        updatedAt: isoDaysAgo(5),
      },
      {
        _id: 'food_15',
        title: 'Fresh Garden Salad Bowls with Citrus Vinaigrette',
        description: 'Leafy greens and raw salads. Expiry elapsed before volunteer pickup.',
        foodType: 'vegan',
        quantity: 20,
        unit: 'plates',
        pickupLocation: {
          address: '88 Connaught Place',
          city: 'New Delhi',
          pincode: '110001',
        },
        availableFrom: isoDaysAgo(4),
        expiryDate: isoDaysAgo(2),
        donor: uDonor3._id,
        status: 'expired',
        claimedBy: null,
        imageUrl: heroImg,
        contactPhone: '+91 97110 55667',
        createdAt: isoDaysAgo(5),
        updatedAt: isoDaysAgo(2),
      },
    ];

    // 3. Seed Pickup Requests
    this.requests = [
      {
        _id: 'req_01',
        listing: 'food_08',
        ngo: uNgo1._id,
        donor: uDonor1._id,
        message: 'We have an insulated van in Bandra West available to collect this food within 45 minutes for our local community center.',
        status: 'pending',
        createdAt: isoHoursFromNow(-2),
        updatedAt: isoHoursFromNow(-2),
      },
      {
        _id: 'req_02',
        listing: 'food_09',
        ngo: uNgo3._id,
        donor: uDonor3._id,
        message: 'Shanti Bhavan volunteers are ready to pick up these fresh baguettes for dinner distribution in Central Delhi.',
        status: 'pending',
        createdAt: isoHoursFromNow(-3),
        updatedAt: isoHoursFromNow(-3),
      },
      {
        _id: 'req_03',
        listing: 'food_10',
        ngo: uNgo2._id,
        donor: uDonor2._id,
        message: 'Robin Food Rescue van en-route to Indiranagar for the South Indian meal batch.',
        status: 'accepted',
        createdAt: isoDaysAgo(1),
        updatedAt: isoDaysAgo(1),
      },
      {
        _id: 'req_04',
        listing: 'food_11',
        ngo: uNgo1._id,
        donor: uDonor1._id,
        message: 'Annakshetra team confirmed pickup scheduled for 2:00 PM.',
        status: 'accepted',
        createdAt: isoDaysAgo(1),
        updatedAt: isoDaysAgo(1),
      },
      {
        _id: 'req_05',
        listing: 'food_12',
        ngo: uNgo3._id,
        donor: uDonor3._id,
        message: 'Volunteers arriving at Connaught Place location at 3:30 PM.',
        status: 'accepted',
        createdAt: isoDaysAgo(2),
        updatedAt: isoDaysAgo(1),
      },
      {
        _id: 'req_06',
        listing: 'food_13',
        ngo: uNgo1._id,
        donor: uDonor1._id,
        message: 'Successfully picked up and distributed to Dharavi center.',
        status: 'completed',
        createdAt: isoDaysAgo(4),
        updatedAt: isoDaysAgo(3),
      },
    ];

    this.initialized = true;
    console.log('[DatabaseStore] Initialized with 7 users, 15 listings, 6 pickup requests.');
  }

  // Periodic expiration checker: sets status to 'expired' for available listings whose expiryDate has passed
  checkExpiry() {
    const now = new Date();
    let count = 0;
    this.listings.forEach((listing) => {
      if (listing.status === 'available' && new Date(listing.expiryDate) <= now) {
        listing.status = 'expired';
        listing.updatedAt = now.toISOString();
        count++;
      }
    });
    if (count > 0) {
      console.log(`[DatabaseStore] Expiry check: Marked ${count} listings as expired.`);
    }
  }

  // Helper to populate donor or NGO
  populateUser(userId: string | IUser | null): IUser | null {
    if (!userId) return null;
    if (typeof userId === 'object' && '_id' in userId) return userId;
    const found = this.users.find((u) => u._id === userId);
    if (!found) return null;
    // exclude password
    const { password, ...safe } = found;
    return safe as IUser;
  }

  populateListing(listingId: string | IFoodListing): IFoodListing | null {
    if (typeof listingId === 'object' && '_id' in listingId) return listingId;
    const found = this.listings.find((l) => l._id === listingId);
    if (!found) return null;
    return {
      ...found,
      donor: this.populateUser(found.donor) || found.donor,
      claimedBy: this.populateUser(found.claimedBy),
    };
  }
}

export const dbStore = new DatabaseStore();

// Run expiry checker every 15 minutes as specified
setInterval(() => {
  dbStore.checkExpiry();
}, 15 * 60 * 1000);
