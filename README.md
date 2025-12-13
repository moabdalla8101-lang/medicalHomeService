# Home Medical Services App - Kuwait

A comprehensive home medical services platform for Kuwait, connecting patients with healthcare providers for in-home medical services.

## Features

### EPIC 1: Authentication & User Management ✅
- Phone number authentication using OTP for Kuwait numbers (+965)
- Role-based authentication (User, Provider, Admin)
- Automatic routing based on user role
- Session persistence

### EPIC 2: User App - Discovery & Browsing ✅
- Instagram-style grid feed of service providers
- Infinite scroll with pagination
- Advanced filters (service type, rating, price, availability)
- Search functionality
- Pull to refresh

### EPIC 3: Provider Profile & Details ✅
- Detailed provider profile pages
- Bio, experience, and specialty information
- Services and pricing display
- Availability calendar
- Reviews and ratings
- Photo gallery

### EPIC 4: Booking System ✅
- Standard booking flow with date/time selection
- Emergency booking flow (ASAP)
- Auto-accept booking logic
- Slot management (prevents double booking)
- Address entry with GPS support
- Price breakdown with commission calculation

### EPIC 5: Payments & Finance ✅
- KNET payment gateway integration (mock implementation)
- Automatic commission calculation
- Provider earnings tracking
- Payment status management

### EPIC 6: Provider App ✅
- Provider onboarding with document upload
- Profile management
- Booking management (view, update status, cancel)
- Earnings dashboard with commission breakdown
- Payout tracking

### EPIC 7: Admin Dashboard ✅
- Provider approval panel
- Booking oversight
- Financial dashboard
- Analytics and reporting
- System configuration

### EPIC 8: Ratings & Reviews ✅
- Mandatory rating after appointment
- Optional text reviews
- Admin moderation
- Provider rating aggregation

### EPIC 9: Notifications ✅
- Push notifications for booking events
- Booking confirmations
- Emergency assignments
- Cancellation notifications
- Payout processed notifications

### EPIC 10: System Configuration ✅
- Configurable platform commission %
- Emergency surcharge settings
- Cancellation window configuration
- Max bookings per day per provider

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React Hot Toast** - Notifications
- **Zod** - Schema validation
- **JWT** - Authentication tokens
- **In-memory Database** - For development (replace with PostgreSQL/MongoDB in production)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local` file:
```bash
JWT_SECRET=your-secret-key-change-in-production
NODE_ENV=development
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
app/
├── api/
│   ├── auth/          # Authentication endpoints
│   ├── providers/     # Provider endpoints
│   ├── bookings/      # Booking endpoints
│   ├── payments/      # Payment endpoints
│   ├── provider/      # Provider app endpoints
│   └── admin/         # Admin endpoints
├── components/        # React components
├── provider/          # Provider app pages
├── admin/             # Admin dashboard pages
└── providers/         # Provider profile pages
lib/
├── types.ts           # TypeScript types
├── db.ts              # Database layer (in-memory)
├── auth.ts            # Authentication utilities
├── bookingService.ts  # Booking logic
└── paymentService.ts  # Payment processing
```

## Authentication

The app uses phone number authentication with OTP:
- Kuwait phone numbers only (+965XXXXXXXX)
- OTP sent via SMS (mock implementation - integrate with SMS service in production)
- JWT tokens for session management
- Role-based access control

## Database

Currently uses an in-memory database for development. **Important**: Replace with a proper database (PostgreSQL, MongoDB, etc.) for production.

## Payment Integration

KNET payment integration is mocked for development. In production:
1. Integrate with actual KNET API
2. Implement proper payment verification
3. Add refund processing
4. Add payment webhooks

## SMS Integration

OTP sending is currently mocked. In production, integrate with:
- Twilio
- AWS SNS
- Or any SMS service provider

## Production Checklist

- [ ] Replace in-memory database with PostgreSQL/MongoDB
- [ ] Integrate real SMS service for OTP
- [ ] Integrate real KNET payment gateway
- [ ] Add proper error logging
- [ ] Add rate limiting
- [ ] Add file upload for provider documents
- [ ] Add image storage (AWS S3, Cloudinary, etc.)
- [ ] Add push notifications (Firebase, OneSignal, etc.)
- [ ] Add proper security headers
- [ ] Add database migrations
- [ ] Add unit and integration tests
- [ ] Add CI/CD pipeline

## License

Private - All rights reserved
