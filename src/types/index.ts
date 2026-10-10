export type UserRole = 'donor' | 'ngo' | 'admin';

export type FoodType = 'veg' | 'non-veg' | 'vegan' | 'bakery' | 'packaged' | 'other';
export type FoodUnit = 'plates' | 'kg' | 'packets' | 'liters' | 'items';
export type ListingStatus = 'available' | 'requested' | 'claimed' | 'completed' | 'expired' | 'cancelled';
export type RequestStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'completed';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  address: string;
  organizationName?: string;
  registrationNumber?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PickupLocation {
  address: string;
  city: string;
  pincode: string;
}

export interface FoodListing {
  _id: string;
  title: string;
  description: string;
  foodType: FoodType;
  quantity: number;
  unit: FoodUnit;
  pickupLocation: PickupLocation;
  availableFrom: string;
  expiryDate: string;
  donor: string | User;
  status: ListingStatus;
  claimedBy: string | User | null;
  imageUrl?: string;
  contactPhone: string;
  createdAt: string;
  updatedAt: string;
}

export interface PickupRequest {
  _id: string;
  listing: string | FoodListing;
  ngo: string | User;
  donor: string | User;
  message: string;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
}

export interface AdminStats {
  users: {
    total: number;
    active: number;
    byRole: {
      donor: number;
      ngo: number;
      admin: number;
    };
  };
  listings: {
    total: number;
    available: number;
    requested: number;
    claimed: number;
    completed: number;
    expired: number;
  };
  totalMealsDonated: number;
  totalRequests: number;
}
