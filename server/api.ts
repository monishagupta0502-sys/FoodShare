import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { dbStore, JWT_SECRET, IUser, IFoodListing, IPickupRequest } from './store.js';

export const apiRouter = express.Router();

// Middleware: Extract Bearer token & verify user
export interface AuthenticatedRequest extends Request {
  user?: IUser;
}

export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Authentication required. No Bearer token provided.', data: null });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    const user = dbStore.users.find((u) => u._id === decoded.id);
    if (!user) {
      res.status(401).json({ success: false, message: 'User not found. Invalid token.', data: null });
      return;
    }
    if (!user.isActive) {
      res.status(403).json({ success: false, message: 'Your account has been deactivated. Contact admin.', data: null });
      return;
    }
    const { password, ...safeUser } = user;
    req.user = safeUser as IUser;
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: 'Token is invalid or expired.', data: null });
    return;
  }
};

// Middleware: Role-based access control
export const roleMiddleware = (...roles: Array<'donor' | 'ngo' | 'admin'>) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.', data: null });
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Forbidden: role '${req.user.role}' is not authorized to access this resource.`,
        data: null,
      });
      return;
    }
    next();
  };
};

const generateToken = (userId: string) => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '7d' });
};

// ==========================================
// 1. AUTH ROUTES
// ==========================================

// POST /api/auth/register
apiRouter.post('/auth/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password, role, phone, address, organizationName, registrationNumber } = req.body;

    if (!name || !email || !password || !role) {
      res.status(400).json({ success: false, message: 'Name, email, password, and role are required.', data: null });
      return;
    }

    if (role === 'admin') {
      res.status(400).json({ success: false, message: 'Admin accounts cannot be self-registered.', data: null });
      return;
    }

    if (!['donor', 'ngo'].includes(role)) {
      res.status(400).json({ success: false, message: "Role must be either 'donor' or 'ngo'.", data: null });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ success: false, message: 'Password must be at least 6 characters.', data: null });
      return;
    }

    if (role === 'ngo' && (!organizationName || !registrationNumber)) {
      res.status(400).json({
        success: false,
        message: 'Organization name and registration number are required for NGO accounts.',
        data: null,
      });
      return;
    }

    const emailNorm = String(email).trim().toLowerCase();
    const existing = dbStore.users.find((u) => u.email.toLowerCase() === emailNorm);
    if (existing) {
      res.status(409).json({ success: false, message: 'An account with this email already exists.', data: null });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const nowIso = new Date().toISOString();

    const newUser: IUser = {
      _id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: String(name).trim(),
      email: emailNorm,
      password: hashedPassword,
      role: role as 'donor' | 'ngo',
      phone: phone || '',
      address: address || '',
      organizationName: role === 'ngo' ? String(organizationName).trim() : undefined,
      registrationNumber: role === 'ngo' ? String(registrationNumber).trim() : undefined,
      isActive: true,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    dbStore.users.push(newUser);

    const token = generateToken(newUser._id);
    const { password: _, ...safeUser } = newUser;

    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      data: { token, user: safeUser },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Registration failed.', data: null });
  }
});

// POST /api/auth/login
apiRouter.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password are required.', data: null });
      return;
    }

    let emailNorm = String(email).trim().toLowerCase();
    // Support convenient shorthand usernames and domain variations
    if (emailNorm === 'donor' || emailNorm === 'donor@foodshare.com') emailNorm = 'donor@foodshare.org';
    if (emailNorm === 'ngo' || emailNorm === 'ego' || emailNorm === 'ngo@foodshare.com' || emailNorm === 'ego@foodshare.org') emailNorm = 'ngo@foodshare.org';
    if (emailNorm === 'admin' || emailNorm === 'admin@foodshare.com') emailNorm = 'admin@foodshare.org';

    const user = dbStore.users.find((u) => u.email.toLowerCase() === emailNorm);
    if (!user || !user.password) {
      res.status(401).json({ success: false, message: 'Invalid email or password.', data: null });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid email or password.', data: null });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({ success: false, message: 'This account has been deactivated. Please contact support.', data: null });
      return;
    }

    const token = generateToken(user._id);
    const { password: _, ...safeUser } = user;

    res.json({
      success: true,
      message: 'Logged in successfully.',
      data: { token, user: safeUser },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Login failed.', data: null });
  }
});

// GET /api/auth/me
apiRouter.get('/auth/me', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  res.json({
    success: true,
    message: 'User profile retrieved.',
    data: req.user,
  });
});

// ==========================================
// 2. USER ROUTES
// ==========================================

// PUT /api/users/profile
apiRouter.put('/users/profile', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = dbStore.users.find((u) => u._id === req.user!._id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.', data: null });
      return;
    }

    const { name, phone, address, organizationName, registrationNumber } = req.body;
    if (name) user.name = String(name).trim();
    if (phone !== undefined) user.phone = String(phone).trim();
    if (address !== undefined) user.address = String(address).trim();
    if (user.role === 'ngo') {
      if (organizationName) user.organizationName = String(organizationName).trim();
      if (registrationNumber) user.registrationNumber = String(registrationNumber).trim();
    }
    user.updatedAt = new Date().toISOString();

    const { password, ...safeUser } = user;
    res.json({
      success: true,
      message: 'Profile updated successfully.',
      data: safeUser,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message, data: null });
  }
});

// PUT /api/users/change-password
apiRouter.put('/users/change-password', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      res.status(400).json({ success: false, message: 'Current password and new password are required.', data: null });
      return;
    }
    if (newPassword.length < 6) {
      res.status(400).json({ success: false, message: 'New password must be at least 6 characters.', data: null });
      return;
    }

    const user = dbStore.users.find((u) => u._id === req.user!._id);
    if (!user || !user.password) {
      res.status(404).json({ success: false, message: 'User not found.', data: null });
      return;
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      res.status(400).json({ success: false, message: 'Incorrect current password.', data: null });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.updatedAt = new Date().toISOString();

    res.json({
      success: true,
      message: 'Password changed successfully.',
      data: null,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message, data: null });
  }
});

// ==========================================
// 3. FOOD LISTINGS ROUTES
// ==========================================

// GET /api/food/stats/donor (must be declared before /api/food/:id)
apiRouter.get('/food/stats/donor', authMiddleware, roleMiddleware('donor'), (req: AuthenticatedRequest, res: Response) => {
  const donorId = req.user!._id;
  const myListings = dbStore.listings.filter((l) => (typeof l.donor === 'object' ? l.donor._id : l.donor) === donorId);

  const total = myListings.length;
  const available = myListings.filter((l) => l.status === 'available').length;
  const requested = myListings.filter((l) => l.status === 'requested').length;
  const claimed = myListings.filter((l) => l.status === 'claimed').length;
  const completed = myListings.filter((l) => l.status === 'completed').length;
  const expired = myListings.filter((l) => l.status === 'expired').length;

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
      totalMeals: myListings.reduce((sum, l) => sum + (l.quantity || 0), 0),
    },
  });
});

// GET /api/food/my (donor only)
apiRouter.get('/food/my', authMiddleware, roleMiddleware('donor'), (req: AuthenticatedRequest, res: Response) => {
  const donorId = req.user!._id;
  const items = dbStore.listings
    .filter((l) => (typeof l.donor === 'object' ? l.donor._id : l.donor) === donorId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map((l) => dbStore.populateListing(l._id)!);

  res.json({
    success: true,
    message: "Donor's food listings retrieved.",
    data: items,
  });
});

// POST /api/food (donor only)
apiRouter.post('/food', authMiddleware, roleMiddleware('donor'), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, description, foodType, quantity, unit, pickupLocation, availableFrom, expiryDate, imageUrl, contactPhone } = req.body;

    if (!title || !quantity || !unit || !pickupLocation || !availableFrom || !expiryDate) {
      res.status(400).json({ success: false, message: 'Missing required listing fields.', data: null });
      return;
    }

    if (Number(quantity) < 1) {
      res.status(400).json({ success: false, message: 'Quantity must be at least 1.', data: null });
      return;
    }

    if (!pickupLocation.address || !pickupLocation.city) {
      res.status(400).json({ success: false, message: 'Pickup address and city are required.', data: null });
      return;
    }

    const start = new Date(availableFrom);
    const end = new Date(expiryDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      res.status(400).json({ success: false, message: 'Invalid date format.', data: null });
      return;
    }

    if (end <= start) {
      res.status(400).json({ success: false, message: 'Expiry date must be after available-from date.', data: null });
      return;
    }

    const defaultImg = '/src/assets/images/foodshare_hero_community_1791608388536.jpg';
    const nowIso = new Date().toISOString();

    const newListing: IFoodListing = {
      _id: `food_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: String(title).trim(),
      description: description ? String(description).trim() : '',
      foodType: foodType || 'veg',
      quantity: Number(quantity),
      unit: unit || 'plates',
      pickupLocation: {
        address: String(pickupLocation.address).trim(),
        city: String(pickupLocation.city).trim(),
        pincode: pickupLocation.pincode ? String(pickupLocation.pincode).trim() : '',
      },
      availableFrom: start.toISOString(),
      expiryDate: end.toISOString(),
      donor: req.user!._id,
      status: 'available',
      claimedBy: null,
      imageUrl: imageUrl || defaultImg,
      contactPhone: contactPhone || req.user!.phone || '',
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    dbStore.listings.unshift(newListing);

    res.status(201).json({
      success: true,
      message: 'Food listing created successfully.',
      data: dbStore.populateListing(newListing._id),
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message, data: null });
  }
});

// GET /api/food (browse / list with query filters)
apiRouter.get('/food', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    dbStore.checkExpiry();

    const { search, foodType, city, status, sortBy = 'expiryDate', order = 'asc', page = '1', limit = '12' } = req.query;

    let items = [...dbStore.listings];

    // Status filter:
    // If NGO or general browse: default to 'available' if no status specified
    if (status && status !== 'all') {
      items = items.filter((item) => item.status === status);
    } else if (!status && req.user!.role === 'ngo') {
      items = items.filter((item) => item.status === 'available');
    }

    // Text Search
    if (search && typeof search === 'string' && search.trim() !== '') {
      const q = search.trim().toLowerCase();
      items = items.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.pickupLocation.city.toLowerCase().includes(q)
      );
    }

    // Food Type filter
    if (foodType && foodType !== 'all') {
      items = items.filter((item) => item.foodType === foodType);
    }

    // City filter
    if (city && city !== 'all') {
      items = items.filter((item) => item.pickupLocation.city.toLowerCase() === String(city).toLowerCase());
    }

    // Sorting
    const sortField = String(sortBy);
    const sortOrder = order === 'desc' ? -1 : 1;
    items.sort((a, b) => {
      let valA: any = a[sortField as keyof IFoodListing];
      let valB: any = b[sortField as keyof IFoodListing];
      if (sortField === 'expiryDate' || sortField === 'createdAt') {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      }
      if (valA < valB) return -1 * sortOrder;
      if (valA > valB) return 1 * sortOrder;
      return 0;
    });

    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const limitNum = Math.max(1, parseInt(String(limit), 10) || 12);
    const total = items.length;
    const startIndex = (pageNum - 1) * limitNum;
    const paginated = items.slice(startIndex, startIndex + limitNum).map((item) => dbStore.populateListing(item._id)!);

    res.json({
      success: true,
      message: 'Food listings retrieved.',
      data: {
        listings: paginated,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message, data: null });
  }
});

// GET /api/food/:id
apiRouter.get('/food/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const listing = dbStore.populateListing(req.params.id);
  if (!listing) {
    res.status(404).json({ success: false, message: 'Food listing not found.', data: null });
    return;
  }

  // Check if current user is NGO and has an accepted request or if user is donor/admin
  const donorId = typeof listing.donor === 'object' ? (listing.donor as any)._id : listing.donor;
  const isDonorOrAdmin = req.user!.role === 'admin' || req.user!._id === donorId;

  // Check if NGO request is accepted for this listing
  let isAcceptedNgo = false;
  if (req.user!.role === 'ngo') {
    const acceptedReq = dbStore.requests.find(
      (r) => (typeof r.listing === 'object' ? (r.listing as any)._id : r.listing) === listing._id &&
             (typeof r.ngo === 'object' ? (r.ngo as any)._id : r.ngo) === req.user!._id &&
             (r.status === 'accepted' || r.status === 'completed')
    );
    if (acceptedReq) isAcceptedNgo = true;
  }

  const responseListing = { ...listing };
  // Hide contact phone unless donor, admin, or accepted NGO
  if (!isDonorOrAdmin && !isAcceptedNgo) {
    responseListing.contactPhone = 'Visible upon request acceptance';
  }

  res.json({
    success: true,
    message: 'Food listing details.',
    data: responseListing,
  });
});

// PUT /api/food/:id (update listing - owner donor only, only if status is available)
apiRouter.put('/food/:id', authMiddleware, roleMiddleware('donor'), (req: AuthenticatedRequest, res: Response) => {
  try {
    const listing = dbStore.listings.find((l) => l._id === req.params.id);
    if (!listing) {
      res.status(404).json({ success: false, message: 'Listing not found.', data: null });
      return;
    }

    const donorId = typeof listing.donor === 'object' ? (listing.donor as any)._id : listing.donor;
    if (donorId !== req.user!._id) {
      res.status(403).json({ success: false, message: 'Not authorized to edit this listing.', data: null });
      return;
    }

    if (listing.status !== 'available') {
      res.status(400).json({ success: false, message: 'Only listings with status "available" can be edited.', data: null });
      return;
    }

    const { title, description, foodType, quantity, unit, pickupLocation, availableFrom, expiryDate, imageUrl, contactPhone } = req.body;
    if (title) listing.title = String(title).trim();
    if (description !== undefined) listing.description = String(description).trim();
    if (foodType) listing.foodType = foodType;
    if (quantity) listing.quantity = Number(quantity);
    if (unit) listing.unit = unit;
    if (pickupLocation) {
      listing.pickupLocation = {
        address: pickupLocation.address || listing.pickupLocation.address,
        city: pickupLocation.city || listing.pickupLocation.city,
        pincode: pickupLocation.pincode || listing.pickupLocation.pincode,
      };
    }
    if (availableFrom) listing.availableFrom = new Date(availableFrom).toISOString();
    if (expiryDate) listing.expiryDate = new Date(expiryDate).toISOString();
    if (imageUrl) listing.imageUrl = imageUrl;
    if (contactPhone) listing.contactPhone = contactPhone;
    listing.updatedAt = new Date().toISOString();

    res.json({
      success: true,
      message: 'Listing updated successfully.',
      data: dbStore.populateListing(listing._id),
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message, data: null });
  }
});

// DELETE /api/food/:id (owner donor or admin; also cancels any pending requests)
apiRouter.delete('/food/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const index = dbStore.listings.findIndex((l) => l._id === req.params.id);
  if (index === -1) {
    res.status(404).json({ success: false, message: 'Listing not found.', data: null });
    return;
  }

  const listing = dbStore.listings[index];
  const donorId = typeof listing.donor === 'object' ? (listing.donor as any)._id : listing.donor;
  const isOwner = req.user!._id === donorId;
  const isAdmin = req.user!.role === 'admin';

  if (!isOwner && !isAdmin) {
    res.status(403).json({ success: false, message: 'Not authorized to delete this listing.', data: null });
    return;
  }

  // Cancel any pending requests on this listing
  dbStore.requests.forEach((reqItem) => {
    const lId = typeof reqItem.listing === 'object' ? (reqItem.listing as any)._id : reqItem.listing;
    if (lId === listing._id && reqItem.status === 'pending') {
      reqItem.status = 'cancelled';
      reqItem.updatedAt = new Date().toISOString();
    }
  });

  dbStore.listings.splice(index, 1);

  res.json({
    success: true,
    message: 'Listing deleted and associated pending requests cancelled.',
    data: null,
  });
});

// ==========================================
// 4. PICKUP REQUESTS ROUTES
// ==========================================

// POST /api/requests (NGO requests a listing { listingId, message })
apiRouter.post('/requests', authMiddleware, roleMiddleware('ngo'), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { listingId, message } = req.body;
    if (!listingId) {
      res.status(400).json({ success: false, message: 'Listing ID is required.', data: null });
      return;
    }

    const listing = dbStore.listings.find((l) => l._id === listingId);
    if (!listing) {
      res.status(404).json({ success: false, message: 'Listing not found.', data: null });
      return;
    }

    if (listing.status !== 'available' && listing.status !== 'requested') {
      res.status(400).json({ success: false, message: `Listing is ${listing.status} and cannot be requested.`, data: null });
      return;
    }

    if (new Date(listing.expiryDate) <= new Date()) {
      listing.status = 'expired';
      res.status(400).json({ success: false, message: 'This food listing has already expired.', data: null });
      return;
    }

    // Compound unique check: an NGO cannot request the same listing twice
    const existingReq = dbStore.requests.find(
      (r) => (typeof r.listing === 'object' ? (r.listing as any)._id : r.listing) === listingId &&
             (typeof r.ngo === 'object' ? (r.ngo as any)._id : r.ngo) === req.user!._id &&
             r.status !== 'cancelled' && r.status !== 'rejected'
    );
    if (existingReq) {
      res.status(409).json({ success: false, message: 'You have already requested this listing.', data: null });
      return;
    }

    const donorId = typeof listing.donor === 'object' ? (listing.donor as any)._id : listing.donor;
    const nowIso = new Date().toISOString();

    const newRequest: IPickupRequest = {
      _id: `req_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      listing: listing._id,
      ngo: req.user!._id,
      donor: donorId,
      message: message ? String(message).trim() : '',
      status: 'pending',
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    dbStore.requests.unshift(newRequest);

    // Update listing status to 'requested' if it was 'available'
    if (listing.status === 'available') {
      listing.status = 'requested';
      listing.updatedAt = nowIso;
    }

    res.status(201).json({
      success: true,
      message: 'Pickup request submitted successfully.',
      data: newRequest,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message, data: null });
  }
});

// GET /api/requests/my (NGO's own requests)
apiRouter.get('/requests/my', authMiddleware, roleMiddleware('ngo'), (req: AuthenticatedRequest, res: Response) => {
  const myRequests = dbStore.requests
    .filter((r) => (typeof r.ngo === 'object' ? (r.ngo as any)._id : r.ngo) === req.user!._id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map((r) => {
      const listing = dbStore.populateListing(r.listing as string);
      const donor = dbStore.populateUser(r.donor as string);
      return {
        ...r,
        listing,
        donor,
      };
    });

  res.json({
    success: true,
    message: "NGO's pickup requests retrieved.",
    data: myRequests,
  });
});

// GET /api/requests/incoming (requests on the donor's listings)
apiRouter.get('/requests/incoming', authMiddleware, roleMiddleware('donor'), (req: AuthenticatedRequest, res: Response) => {
  const donorId = req.user!._id;
  const incoming = dbStore.requests
    .filter((r) => (typeof r.donor === 'object' ? (r.donor as any)._id : r.donor) === donorId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map((r) => {
      const listing = dbStore.populateListing(r.listing as string);
      const ngo = dbStore.populateUser(r.ngo as string);
      return {
        ...r,
        listing,
        ngo,
      };
    });

  res.json({
    success: true,
    message: 'Incoming requests retrieved.',
    data: incoming,
  });
});

// PUT /api/requests/:id/accept (donor accepts)
apiRouter.put('/requests/:id/accept', authMiddleware, roleMiddleware('donor'), (req: AuthenticatedRequest, res: Response) => {
  const request = dbStore.requests.find((r) => r._id === req.params.id);
  if (!request) {
    res.status(404).json({ success: false, message: 'Pickup request not found.', data: null });
    return;
  }

  const donorId = typeof request.donor === 'object' ? (request.donor as any)._id : request.donor;
  if (donorId !== req.user!._id) {
    res.status(403).json({ success: false, message: 'You can only accept requests on your own listings.', data: null });
    return;
  }

  if (request.status !== 'pending') {
    res.status(400).json({ success: false, message: `Request is already ${request.status}.`, data: null });
    return;
  }

  const listingId = typeof request.listing === 'object' ? (request.listing as any)._id : request.listing;
  const listing = dbStore.listings.find((l) => l._id === listingId);
  if (!listing) {
    res.status(404).json({ success: false, message: 'Associated listing not found.', data: null });
    return;
  }

  if (listing.status === 'claimed' || listing.status === 'completed') {
    res.status(400).json({ success: false, message: 'This listing has already been claimed or completed.', data: null });
    return;
  }

  const nowIso = new Date().toISOString();
  request.status = 'accepted';
  request.updatedAt = nowIso;

  const ngoId = typeof request.ngo === 'object' ? (request.ngo as any)._id : request.ngo;
  listing.status = 'claimed';
  listing.claimedBy = ngoId;
  listing.updatedAt = nowIso;

  // Auto-reject other pending requests for this listing
  dbStore.requests.forEach((r) => {
    const lId = typeof r.listing === 'object' ? (r.listing as any)._id : r.listing;
    if (lId === listing._id && r._id !== request._id && r.status === 'pending') {
      r.status = 'rejected';
      r.updatedAt = nowIso;
    }
  });

  res.json({
    success: true,
    message: 'Pickup request accepted. Listing is now claimed and contact details are available.',
    data: {
      request,
      listing: dbStore.populateListing(listing._id),
    },
  });
});

// PUT /api/requests/:id/reject (donor rejects)
apiRouter.put('/requests/:id/reject', authMiddleware, roleMiddleware('donor'), (req: AuthenticatedRequest, res: Response) => {
  const request = dbStore.requests.find((r) => r._id === req.params.id);
  if (!request) {
    res.status(404).json({ success: false, message: 'Pickup request not found.', data: null });
    return;
  }

  const donorId = typeof request.donor === 'object' ? (request.donor as any)._id : request.donor;
  if (donorId !== req.user!._id) {
    res.status(403).json({ success: false, message: 'Not authorized to reject this request.', data: null });
    return;
  }

  if (request.status !== 'pending') {
    res.status(400).json({ success: false, message: `Request is already ${request.status}.`, data: null });
    return;
  }

  request.status = 'rejected';
  request.updatedAt = new Date().toISOString();

  // If there are no other pending requests for this listing, revert listing status to 'available'
  const listingId = typeof request.listing === 'object' ? (request.listing as any)._id : request.listing;
  const listing = dbStore.listings.find((l) => l._id === listingId);
  if (listing && listing.status === 'requested') {
    const otherPending = dbStore.requests.some(
      (r) => (typeof r.listing === 'object' ? (r.listing as any)._id : r.listing) === listingId &&
             r._id !== request._id && r.status === 'pending'
    );
    if (!otherPending) {
      listing.status = 'available';
      listing.updatedAt = new Date().toISOString();
    }
  }

  res.json({
    success: true,
    message: 'Pickup request rejected.',
    data: request,
  });
});

// PUT /api/requests/:id/cancel (NGO cancels own pending request)
apiRouter.put('/requests/:id/cancel', authMiddleware, roleMiddleware('ngo'), (req: AuthenticatedRequest, res: Response) => {
  const request = dbStore.requests.find((r) => r._id === req.params.id);
  if (!request) {
    res.status(404).json({ success: false, message: 'Pickup request not found.', data: null });
    return;
  }

  const ngoId = typeof request.ngo === 'object' ? (request.ngo as any)._id : request.ngo;
  if (ngoId !== req.user!._id) {
    res.status(403).json({ success: false, message: 'You can only cancel your own requests.', data: null });
    return;
  }

  if (request.status !== 'pending') {
    res.status(400).json({ success: false, message: 'Only pending requests can be cancelled.', data: null });
    return;
  }

  request.status = 'cancelled';
  request.updatedAt = new Date().toISOString();

  // Check if listing should revert to 'available'
  const listingId = typeof request.listing === 'object' ? (request.listing as any)._id : request.listing;
  const listing = dbStore.listings.find((l) => l._id === listingId);
  if (listing && listing.status === 'requested') {
    const otherPending = dbStore.requests.some(
      (r) => (typeof r.listing === 'object' ? (r.listing as any)._id : r.listing) === listingId &&
             r._id !== request._id && r.status === 'pending'
    );
    if (!otherPending) {
      listing.status = 'available';
      listing.updatedAt = new Date().toISOString();
    }
  }

  res.json({
    success: true,
    message: 'Pickup request cancelled.',
    data: request,
  });
});

// PUT /api/requests/:id/complete (donor marks pickup as completed; listing becomes completed)
apiRouter.put('/requests/:id/complete', authMiddleware, roleMiddleware('donor'), (req: AuthenticatedRequest, res: Response) => {
  const request = dbStore.requests.find((r) => r._id === req.params.id);
  if (!request) {
    res.status(404).json({ success: false, message: 'Request not found.', data: null });
    return;
  }

  const donorId = typeof request.donor === 'object' ? (request.donor as any)._id : request.donor;
  if (donorId !== req.user!._id) {
    res.status(403).json({ success: false, message: 'Not authorized to complete this request.', data: null });
    return;
  }

  if (request.status !== 'accepted') {
    res.status(400).json({ success: false, message: 'Only accepted requests can be marked completed.', data: null });
    return;
  }

  const nowIso = new Date().toISOString();
  request.status = 'completed';
  request.updatedAt = nowIso;

  const listingId = typeof request.listing === 'object' ? (request.listing as any)._id : request.listing;
  const listing = dbStore.listings.find((l) => l._id === listingId);
  if (listing) {
    listing.status = 'completed';
    listing.updatedAt = nowIso;
  }

  res.json({
    success: true,
    message: 'Food donation marked as successfully completed.',
    data: { request, listing: listing ? dbStore.populateListing(listing._id) : null },
  });
});

// ==========================================
// 5. ADMIN ROUTES
// ==========================================

// GET /api/admin/stats (platform statistics)
apiRouter.get('/admin/stats', authMiddleware, roleMiddleware('admin'), (_req: AuthenticatedRequest, res: Response) => {
  dbStore.checkExpiry();

  const totalUsers = dbStore.users.length;
  const donorsCount = dbStore.users.filter((u) => u.role === 'donor').length;
  const ngosCount = dbStore.users.filter((u) => u.role === 'ngo').length;
  const adminsCount = dbStore.users.filter((u) => u.role === 'admin').length;
  const activeUsers = dbStore.users.filter((u) => u.isActive).length;

  const totalListings = dbStore.listings.length;
  const availableListings = dbStore.listings.filter((l) => l.status === 'available').length;
  const requestedListings = dbStore.listings.filter((l) => l.status === 'requested').length;
  const claimedListings = dbStore.listings.filter((l) => l.status === 'claimed').length;
  const completedListings = dbStore.listings.filter((l) => l.status === 'completed').length;
  const expiredListings = dbStore.listings.filter((l) => l.status === 'expired').length;

  const completedItems = dbStore.listings.filter((l) => l.status === 'completed');
  const totalMealsDonated = completedItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const totalRequests = dbStore.requests.length;

  res.json({
    success: true,
    message: 'Admin platform statistics.',
    data: {
      users: {
        total: totalUsers,
        active: activeUsers,
        byRole: { donor: donorsCount, ngo: ngosCount, admin: adminsCount },
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
});

// GET /api/admin/users (all users with filter by role)
apiRouter.get('/admin/users', authMiddleware, roleMiddleware('admin'), (req: AuthenticatedRequest, res: Response) => {
  const { role } = req.query;
  let list = dbStore.users;
  if (role && role !== 'all') {
    list = list.filter((u) => u.role === role);
  }

  const safeUsers = list.map((u) => {
    const { password, ...safe } = u;
    return safe;
  });

  res.json({
    success: true,
    message: 'User list retrieved.',
    data: safeUsers,
  });
});

// PUT /api/admin/users/:id/toggle (activate or deactivate user)
apiRouter.put('/admin/users/:id/toggle', authMiddleware, roleMiddleware('admin'), (req: AuthenticatedRequest, res: Response) => {
  const user = dbStore.users.find((u) => u._id === req.params.id);
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found.', data: null });
    return;
  }

  if (user._id === req.user!._id) {
    res.status(400).json({ success: false, message: 'Admin cannot deactivate their own account.', data: null });
    return;
  }

  user.isActive = !user.isActive;
  user.updatedAt = new Date().toISOString();

  const { password, ...safeUser } = user;
  res.json({
    success: true,
    message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully.`,
    data: safeUser,
  });
});

// DELETE /api/admin/users/:id (delete user)
apiRouter.delete('/admin/users/:id', authMiddleware, roleMiddleware('admin'), (req: AuthenticatedRequest, res: Response) => {
  const index = dbStore.users.findIndex((u) => u._id === req.params.id);
  if (index === -1) {
    res.status(404).json({ success: false, message: 'User not found.', data: null });
    return;
  }

  if (dbStore.users[index]._id === req.user!._id) {
    res.status(400).json({ success: false, message: 'Admin cannot delete their own account.', data: null });
    return;
  }

  const removed = dbStore.users.splice(index, 1)[0];
  const { password, ...safeRemoved } = removed;

  res.json({
    success: true,
    message: 'User deleted successfully.',
    data: safeRemoved,
  });
});

// GET /api/admin/listings (all listings platform-wide)
apiRouter.get('/admin/listings', authMiddleware, roleMiddleware('admin'), (_req: AuthenticatedRequest, res: Response) => {
  dbStore.checkExpiry();
  const allListings = dbStore.listings
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map((l) => dbStore.populateListing(l._id)!);

  res.json({
    success: true,
    message: 'All platform listings retrieved.',
    data: allListings,
  });
});

// DELETE /api/admin/listings/:id (delete any listing)
apiRouter.delete('/admin/listings/:id', authMiddleware, roleMiddleware('admin'), (req: AuthenticatedRequest, res: Response) => {
  const index = dbStore.listings.findIndex((l) => l._id === req.params.id);
  if (index === -1) {
    res.status(404).json({ success: false, message: 'Listing not found.', data: null });
    return;
  }

  const listing = dbStore.listings[index];
  // Cancel any pending requests on this listing
  dbStore.requests.forEach((reqItem) => {
    const lId = typeof reqItem.listing === 'object' ? (reqItem.listing as any)._id : reqItem.listing;
    if (lId === listing._id && reqItem.status === 'pending') {
      reqItem.status = 'cancelled';
      reqItem.updatedAt = new Date().toISOString();
    }
  });

  dbStore.listings.splice(index, 1);

  res.json({
    success: true,
    message: 'Listing deleted by admin.',
    data: null,
  });
});
