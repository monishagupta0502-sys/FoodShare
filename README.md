# FoodShare - Surplus Food Donation Marketplace

A production-ready full-stack **MERN (MongoDB, Express, React, Node.js)** application that connects commercial food donors (restaurants, caterers, banquet halls, hotels) with verified non-governmental organizations (NGOs) to eliminate food waste and distribute surplus meals to communities in need.

---

## 1. Project Overview & Architecture

### Objectives
- **Zero Food Waste Logistics**: Allow commercial kitchens to list perishable and packaged surplus meals within minutes.
- **Role-Based Access Control (RBAC)**: Enforce distinct privileges for **Donors**, **NGOs**, and **Platform Admins** on both server and client.
- **Real-Time Expiry & Urgency Engine**: Automatic background job running every 15 minutes to mark elapsed food listings as `expired`.
- **Verified Handover Workflow**: NGOs request pickups with vehicle/arrival notes; donors review and accept, unlocking direct contact details and auto-rejecting competing requests.

```
                              ┌────────────────────────────────────────┐
                              │            FoodShare Client            │
                              │        React 19 + Tailwind CSS         │
                              └───────────────────┬────────────────────┘
                                                  │
                                            JWT Bearer Auth
                                                  │
                                                  ▼
                              ┌────────────────────────────────────────┐
                              │          Express REST API              │
                              │    Auth, Food, Requests, Admin Router  │
                              └───────────┬──────────────┬─────────────┘
                                          │              │
                                ┌─────────▼──────┐ ┌─────▼─────────────┐
                                │ Mongoose Model │ │ Expiry Background │
                                │    & Database  │ │    Cron Job       │
                                └────────────────┘ └───────────────────┘
```

---

## 2. User Roles & Permissions

| Role | Permissions & Capabilities |
| :--- | :--- |
| **Donor** | • Register and login.<br>• Create, browse, update, and delete own food listings.<br>• View incoming NGO pickup requests on own food items.<br>• Accept or reject incoming requests.<br>• Mark accepted requests as `completed` after successful handover.<br>• View donor KPI dashboard (Total, Available, Claimed, Completed). |
| **NGO** | • Register with mandatory organization name & registration number.<br>• Search and filter surplus food listings by keyword, food category, and city.<br>• View detailed listings with real-time countdown timer.<br>• Submit pickup requests with optional vehicle or arrival notes.<br>• View request history and cancel pending requests.<br>• Access donor direct contact phone once request is accepted. |
| **Admin** | • Platform-wide telemetry (Total users, active count, listings by status, meals donated).<br>• View, activate/deactivate, and delete any user account.<br>• View and delete any food listing platform-wide.<br>• Interactive visual charts (Listing status distribution & user role breakdown). |

---

## 3. Database Schema (MongoDB + Mongoose)

### 3.1 User Model (`User`)
- `name` (String, required, trimmed)
- `email` (String, required, unique, lowercase, regex-validated)
- `password` (String, required, min 6 characters, hashed with bcrypt 10 rounds, `select: false`)
- `role` (String, enum: `['donor', 'ngo', 'admin']`, default: `'donor'`)
- `phone` (String, default: `''`)
- `address` (String, default: `''`)
- `organizationName` (String, required if role is `'ngo'`)
- `registrationNumber` (String, required if role is `'ngo'`)
- `isActive` (Boolean, default: `true`)
- `createdAt` / `updatedAt` (Timestamps)

### 3.2 FoodListing Model (`FoodListing`)
- `title` (String, required)
- `description` (String)
- `foodType` (String, enum: `['veg', 'non-veg', 'vegan', 'bakery', 'packaged', 'other']`)
- `quantity` (Number, required, min: 1)
- `unit` (String, enum: `['plates', 'kg', 'packets', 'liters', 'items']`)
- `pickupLocation`: `{ address: String, city: String, pincode: String }`
- `availableFrom` (Date, required)
- `expiryDate` (Date, required, validated to be after `availableFrom`)
- `donor` (ObjectId ref `'User'`, required)
- `status` (String, enum: `['available', 'requested', 'claimed', 'completed', 'expired', 'cancelled']`, default: `'available'`)
- `claimedBy` (ObjectId ref `'User'`, default: `null`)
- `imageUrl` (String, optional)
- `contactPhone` (String)
- `createdAt` / `updatedAt` (Timestamps)
- *Indexes*: Text index on `(title, description)`, compound index on `(status, expiryDate)`, index on `donor`, index on `pickupLocation.city`.

### 3.3 PickupRequest Model (`PickupRequest`)
- `listing` (ObjectId ref `'FoodListing'`, required)
- `ngo` (ObjectId ref `'User'`, required)
- `donor` (ObjectId ref `'User'`, required)
- `message` (String, optional arrival or transport note)
- `status` (String, enum: `['pending', 'accepted', 'rejected', 'cancelled', 'completed']`, default: `'pending'`)
- `createdAt` / `updatedAt` (Timestamps)
- *Indexes*: Compound unique index on `(listing, ngo)` preventing duplicate requests.

---

## 4. REST API Documentation

All responses follow the standardized envelope:
```json
{
  "success": true,
  "message": "Operation description",
  "data": { ... }
}
```

### 4.1 Authentication Endpoints
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register a donor or NGO account |
| `POST` | `/api/auth/login` | Public | Authenticate and obtain 7-day JWT token |
| `GET` | `/api/auth/me` | Protected | Fetch current user profile |

### 4.2 User Profile Endpoints
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `PUT` | `/api/users/profile` | Protected | Update profile (name, phone, address, NGO org details) |
| `PUT` | `/api/users/change-password` | Protected | Change password with current password verification |

### 4.3 Food Listings Endpoints
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/food` | Donor only | Create a new food listing |
| `GET` | `/api/food` | Protected | Search/filter listings (`search`, `foodType`, `city`, `sortBy`, `page`) |
| `GET` | `/api/food/my` | Donor only | Retrieve all listings owned by current donor |
| `GET` | `/api/food/stats/donor` | Donor only | Get donor dashboard statistics |
| `GET` | `/api/food/:id` | Protected | Retrieve full listing details |
| `PUT` | `/api/food/:id` | Donor only | Update listing (only if status is `available`) |
| `DELETE` | `/api/food/:id` | Owner / Admin | Delete listing and cancel pending requests |

### 4.4 Pickup Requests Endpoints
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/requests` | NGO only | Submit pickup request `{ listingId, message }` |
| `GET` | `/api/requests/my` | NGO only | Get all requests made by the NGO |
| `GET` | `/api/requests/incoming`| Donor only | Get incoming requests on donor's listings |
| `PUT` | `/api/requests/:id/accept` | Donor only | Accept request, mark claimed, auto-reject other pending |
| `PUT` | `/api/requests/:id/reject` | Donor only | Reject request |
| `PUT` | `/api/requests/:id/cancel` | NGO only | Cancel own pending request |
| `PUT` | `/api/requests/:id/complete`| Donor only | Complete donation handover |

### 4.5 Admin Endpoints
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/stats` | Admin only | Platform-wide metrics and status breakdowns |
| `GET` | `/api/admin/users` | Admin only | List all users (filter by `role`) |
| `PUT` | `/api/admin/users/:id/toggle` | Admin only | Toggle active/deactive status |
| `DELETE` | `/api/admin/users/:id` | Admin only | Delete user account |
| `GET` | `/api/admin/listings` | Admin only | View all listings platform-wide |
| `DELETE` | `/api/admin/listings/:id`| Admin only | Remove listing by admin |

---

## 5. Seed Test Credentials

The database comes pre-seeded with tested accounts for all roles:

| Role | Account Name | Email / Shorthand | Password |
| :--- | :--- | :--- | :--- |
| **Admin** | Super Admin | `admin@foodshare.org` (or `admin`) | `admin123` |
| **Donor** | FoodShare Partner Kitchen | `donor@foodshare.org` (or `donor`) | `donor123` |
| **Donor** | The Grand Taj Hotel & Banquets | `taj@culinary.com` | `donor123` |
| **Donor** | Greenleaf Organic Cafe & Bakery | `greenleaf@bistro.com` | `donor123` |
| **NGO** | Food Relief Foundation | `ngo@foodshare.org` (or `ngo`) | `ngo123` |
| **NGO** | Anita Sharma (Annakshetra Foundation) | `care@annakshetra.org` | `ngo123` |
| **NGO** | Vikram Menon (Robin Food Rescue Network) | `feed@robinhood.org` | `ngo123` |

*(On the `/login` page, you can either click the one-tap test account buttons or type any of the emails above.)*

---

## 6. Testing Checklist (End-to-End Verification)

- [x] **Public Exploration**: Review home hero banner, impact metrics, "How it Works" guide, and browse food listings.
- [x] **Donor Workflow**:
  - Log in with `taj@culinary.com` / `donor123`.
  - View only Donor features in navbar: **Dashboard**, **My Listings**, **Add Food**, **Requests**.
  - Navigate to `/donor/dashboard` to check KPI cards and recent listings.
  - Click **Add Food Listing** (`/donor/add-food`), submit a new surplus meal batch.
  - Visit `/donor/listings` to verify newly added listing, edit it, or delete with confirmation.
  - Visit `/donor/requests`, review pending NGO requests, click **Accept & Claim**, then **Mark Pickup Completed**.
  - Verify that attempting to navigate to `/admin/dashboard` or `/ngo/requests` is blocked with `403 Access Restricted`.
- [x] **NGO Workflow**:
  - Log in with `care@annakshetra.org` / `ngo123`.
  - View only NGO features in navbar: **Browse Food**, **My Requests**.
  - Browse listings at `/ngo/browse`, filter by category or city.
  - Open a listing (`/food/:id`), verify countdown timer, and submit a pickup request.
  - Visit `/ngo/requests` to verify request history, status badges, and unlocked donor contact information upon acceptance.
  - Verify that attempting to navigate to `/admin/dashboard` or `/donor/add-food` is blocked with `403 Access Restricted`.
- [x] **Admin Workflow**:
  - Log in with `admin@foodshare.org` / `admin123`.
  - View only Admin features in navbar: **Dashboard**, **Users**, **Listings**.
  - View `/admin/dashboard` to inspect Recharts distribution graphs.
  - Open `/admin/users` to filter by role and toggle account activation or delete accounts.
  - Open `/admin/listings` to review and delete listings platform-wide.
  - Verify that attempting to navigate to `/donor/dashboard` or `/ngo/browse` is blocked with `403 Access Restricted`.
- [x] **Security & RBAC Enforcement**:
  - Unauthenticated access to protected routes automatically redirects to `/login`.
  - Server endpoints return HTTP `403 Forbidden` whenever token role does not match required permissions.
  - Passwords are encrypted with bcrypt; tokens are verified on every request.
