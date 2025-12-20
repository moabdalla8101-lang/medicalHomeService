# Home Medical Services App - Kuwait

A comprehensive home medical services platform for Kuwait, connecting patients with healthcare providers for in-home medical services. Built with Next.js 14, TypeScript, and PostgreSQL, featuring full RTL (Right-to-Left) support for Arabic language.

## 🚀 Features

### EPIC 1: Authentication & User Management ✅
- **Phone Number Authentication**: OTP-based authentication for Kuwait numbers (+965XXXXXXXX)
- **Twilio WhatsApp Integration**: OTP sent via WhatsApp using Twilio Content API
- **Role-Based Authentication**: Support for 4 user roles (User, Provider, Admin, Medical Centre)
- **Automatic Role Routing**: Users redirected to appropriate dashboard based on role
- **Session Management**: JWT tokens with 7-day expiration
- **Login/Register Entry Points**: Accessible from home page header
- **User Profile Management**: Edit name, view addresses from booking history

### EPIC 2: User App - Discovery & Browsing ✅
- **Instagram-Style Grid Feed**: Responsive card-based provider display
- **Infinite Scroll**: Pagination with automatic loading
- **Advanced Filters**: 
  - Service type filtering
  - Minimum rating filter
  - Maximum price filter
  - Available now filter
  - Emergency availability filter
- **Real-Time Search**: Search providers by name or specialty
- **RTL Layout**: Full Arabic language support with right-to-left layout
- **Responsive Design**: Mobile-first design for all screen sizes

### EPIC 3: Provider Profile & Details ✅
- **Detailed Provider Profiles**: Comprehensive provider information pages
- **Provider Information Display**:
  - Bio and experience
  - Specialty and qualifications
  - Profile photo and gallery
  - Medical centre affiliation (if applicable)
- **Services & Pricing**: Service catalog with prices and durations
- **Availability Calendar**: 7-day availability view with time slots
- **Reviews & Ratings**: 
  - Star ratings (1-5 stars)
  - User comments
  - Average rating calculation
  - Review count display
- **Photo Gallery**: Multiple photos showcase
- **Emergency Availability Badge**: Visual indicator for emergency services
- **Booking Integration**: Direct booking from profile page

### EPIC 4: Booking System ✅
- **Standard Booking Flow**:
  - Service selection
  - Date and time selection
  - Address entry with GPS coordinates
  - Notes and special instructions
  - Price breakdown review
- **Emergency Booking Flow**: ASAP booking for urgent medical needs
- **Auto-Accept Logic**: Automatic booking confirmation for standard bookings
- **Slot Management**: Prevents double booking with availability tracking
- **Address Management**: 
  - Full address entry
  - GPS coordinates capture
  - Address history from previous bookings
- **Price Breakdown**:
  - Service price
  - Emergency surcharge (25% for emergency bookings)
  - Platform commission (15%)
  - Total price calculation
- **Booking Status Tracking**: 
  - Requested → Confirmed → In Progress → On the Way → Completed
  - Cancellation support with reason tracking
- **Post-Booking Redirect**: Automatic redirect to user profile after booking completion

### EPIC 5: Payments & Finance ✅
- **KNET Payment Gateway**: Integration ready (mock implementation for development)
- **Automatic Commission Calculation**: 15% platform commission
- **Provider Earnings Tracking**: Net earnings after commission
- **Payment Status Management**: 
  - Pending → Paid → Refunded
  - Payment method tracking
  - Transaction ID storage
- **Financial Dashboard**: Revenue tracking and analytics

### EPIC 6: Provider App ✅
- **Provider Onboarding**: 
  - Profile creation with document upload
  - Medical license verification
  - Civil ID verification
  - IBAN for payouts
- **Profile Management**: 
  - Edit profile information
  - Upload profile photo
  - Manage photo gallery
  - Update bio and experience
- **Booking Management**:
  - View all bookings
  - Update booking status
  - Cancel bookings with reason
  - Track booking history
- **Earnings Dashboard**: 
  - Total earnings
  - Commission breakdown
  - Monthly earnings
  - Payout tracking
- **Availability Manager**: 
  - Set weekly availability
  - Manage time slots
  - Block/unblock dates
- **Statistics Dashboard**: 
  - Today's bookings
  - Pending bookings
  - Total earnings
  - Monthly earnings

### EPIC 7: Admin Dashboard ✅
- **Provider Approval Panel**: 
  - View pending provider applications
  - Approve/reject providers
  - View provider documents
  - Rejection reason management
- **Booking Oversight**: 
  - View all bookings
  - Filter by status
  - Booking details and management
- **Financial Dashboard**: 
  - Revenue analytics
  - Commission tracking
  - Payment status overview
- **Reviews Management**: 
  - View all reviews (All, Pending, Approved, Rejected)
  - Approve/reject reviews
  - Review moderation interface
  - Filter by status
- **Analytics & Reporting**: 
  - Provider statistics
  - Booking statistics
  - Revenue reports
- **System Configuration**: 
  - Platform commission percentage
  - Emergency surcharge settings
  - Cancellation window configuration
  - Max bookings per day per provider
- **Data Seeding**: Dummy data generation for testing

### EPIC 8: Ratings & Reviews ✅
- **User Rating System**: 
  - 1-5 star rating after completed bookings
  - Optional text comments
  - Rating modal with RTL support
- **Auto-Approval**: Reviews automatically approved and visible immediately
- **Provider Rating Aggregation**: 
  - Average rating calculation
  - Total review count
  - Real-time rating updates
- **Review Display**: 
  - Reviews on provider profiles
  - Review history in user dashboard
  - Rating badges and stars
- **Admin Moderation**: 
  - Review approval/rejection interface
  - Review filtering and management
  - Status tracking

### EPIC 9: User Dashboard ✅
- **Profile Management Tab**: 
  - Edit user name
  - View phone number
  - Display unique addresses from booking history
- **Current Bookings Tab**: 
  - View active bookings (requested, confirmed, in_progress)
  - Booking status tracking
  - Booking details display
- **History Tab**: 
  - View completed and cancelled bookings
  - Rating prompts for completed bookings
  - Review submission interface
  - Booking history with dates and services
- **RTL Layout**: Full Arabic language support

### EPIC 10: Medical Centre Management ✅
- **Medical Centre Dashboard**: 
  - Centre-specific analytics
  - Provider management
  - Booking oversight
  - Revenue tracking
- **Provider Management**: 
  - View all providers in centre
  - Provider details and status
  - Provider performance metrics
- **Availability Management**: 
  - Set availability for centre providers
  - Weekly slot generation
  - Bulk availability updates
- **Analytics Dashboard**: 
  - Centre-specific statistics
  - Booking trends
  - Revenue analytics
  - Provider performance

### EPIC 11: Notifications ✅
- **Booking Notifications**: 
  - Booking confirmations
  - Status updates
  - Cancellation notifications
- **Emergency Notifications**: 
  - Emergency assignment alerts
  - Provider assignment notifications
- **Payment Notifications**: 
  - Payment success/failure
  - Payout processed notifications
- **System Notifications**: 
  - Provider approval/rejection
  - Profile updates

### EPIC 12: Internationalization (i18n) ✅
- **Arabic Language Support**: 
  - Full RTL (Right-to-Left) layout
  - Arabic translations for all UI elements
  - RTL-aware components and styling
- **CSS Grid Layout**: 
  - Proper RTL alignment
  - Responsive grid system
  - Direction-aware layouts
- **Date Formatting**: Arabic locale date formatting (ar-KW)
- **Toast Notifications**: RTL-styled notifications

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety and better developer experience
- **Tailwind CSS** - Utility-first CSS framework
- **React Hot Toast** - Toast notifications with RTL support
- **Lucide React** - Icon library
- **React Infinite Scroll** - Infinite scrolling component
- **Zod** - Schema validation for forms and API

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **Prisma ORM** - Database ORM with type safety
- **PostgreSQL** - Production database (Supabase)
- **JWT** - JSON Web Tokens for authentication
- **jsonwebtoken** - JWT token generation and verification

### Third-Party Integrations
- **Twilio WhatsApp API** - OTP delivery via WhatsApp
- **Supabase** - PostgreSQL database hosting

### Development Tools
- **Prisma Client** - Type-safe database client
- **ESLint** - Code linting
- **TypeScript** - Static type checking

## 📁 Project Structure

```
app/
├── api/                    # API Routes
│   ├── admin/             # Admin endpoints
│   │   ├── bookings/      # Admin booking management
│   │   ├── financials/    # Financial reports
│   │   ├── providers/     # Provider approval/rejection
│   │   ├── reviews/       # Review moderation
│   │   ├── settings/      # System configuration
│   │   └── stats/         # Admin statistics
│   ├── auth/              # Authentication endpoints
│   │   ├── me/            # Get current user
│   │   ├── send-otp/      # Send OTP via WhatsApp
│   │   ├── update-role/   # Role management
│   │   └── verify-otp/    # Verify OTP and authenticate
│   ├── bookings/          # Booking endpoints
│   │   └── [id]/status/   # Update booking status
│   ├── medical-centre/    # Medical centre endpoints
│   │   ├── analytics/     # Centre analytics
│   │   ├── availability/  # Availability management
│   │   ├── bookings/      # Centre bookings
│   │   ├── dashboard/     # Centre dashboard data
│   │   └── providers/     # Centre provider management
│   ├── payments/          # Payment endpoints
│   │   ├── initiate/      # Initiate payment
│   │   └── process/       # Process payment callback
│   ├── provider/          # Provider app endpoints
│   │   ├── availability/  # Provider availability
│   │   ├── earnings/      # Provider earnings
│   │   ├── profile/       # Provider profile CRUD
│   │   ├── stats/         # Provider statistics
│   │   └── upload-photo/  # Photo upload
│   ├── providers/         # Public provider endpoints
│   │   └── [id]/          # Provider details
│   ├── reviews/           # Review endpoints
│   └── user/              # User endpoints
│       └── profile/       # User profile management
├── admin/                 # Admin dashboard page
├── components/            # React components
│   ├── AdminBookings.tsx
│   ├── AdminDashboard.tsx
│   ├── AdminFinancials.tsx
│   ├── AdminProviderApproval.tsx
│   ├── AdminReviews.tsx
│   ├── AdminSettings.tsx
│   ├── AvailabilityManager.tsx
│   ├── BookingModal.tsx
│   ├── MedicalCentreAnalytics.tsx
│   ├── MedicalCentreAvailability.tsx
│   ├── MedicalCentreBookings.tsx
│   ├── MedicalCentreDashboard.tsx
│   ├── MedicalCentreProviders.tsx
│   ├── PhoneAuth.tsx
│   ├── ProviderBookings.tsx
│   ├── ProviderCard.tsx
│   ├── ProviderDashboard.tsx
│   ├── ProviderEarnings.tsx
│   ├── ProviderFeed.tsx
│   ├── ProviderFilters.tsx
│   ├── ProviderProfile.tsx
│   ├── ProviderProfileEdit.tsx
│   ├── RatingModal.tsx
│   ├── UserBookings.tsx
│   ├── UserDashboard.tsx
│   └── UserProfileEdit.tsx
├── medical-centre/        # Medical centre dashboard page
├── provider/              # Provider dashboard page
├── providers/             # Provider profile pages
│   └── [id]/              # Individual provider page
├── user/                  # User dashboard page
├── layout.tsx             # Root layout with RTL support
└── page.tsx               # Home page with provider feed

lib/
├── auth.ts                # Authentication utilities
├── bookingService.ts      # Booking business logic
├── db.ts                  # Database operations (Prisma)
├── paymentService.ts      # Payment processing
├── types.ts               # TypeScript type definitions
└── whatsapp.ts            # Twilio WhatsApp integration

prisma/
├── schema.prisma          # Database schema
└── migrations/           # Database migrations
```

## 🗄️ Database Schema

The application uses PostgreSQL with Prisma ORM. Key models include:

- **User**: User accounts with role-based access
- **ProviderProfile**: Healthcare provider profiles
- **MedicalCentre**: Medical centre organizations
- **Service**: Services offered by providers
- **AvailabilitySlot**: Provider time slot availability
- **Booking**: Patient bookings
- **Review**: Provider reviews and ratings
- **Payment**: Payment transactions
- **Notification**: User notifications
- **SystemConfig**: System-wide configuration
- **OTP**: OTP storage for authentication

## 🔐 Authentication Flow

1. **User enters phone number** → OTP sent via Twilio WhatsApp
2. **User enters OTP** → Verified against stored OTP
3. **User created/updated** → Role assigned based on login page
4. **JWT token generated** → 7-day expiration
5. **Session stored** → Token in localStorage, session in database
6. **Automatic routing** → User redirected to appropriate dashboard

## 📱 User Roles

### User (Customer)
- Browse providers
- Book appointments
- Rate providers
- Manage profile and bookings
- View booking history

### Provider
- Create and manage profile
- Set availability
- Manage bookings
- Track earnings
- Upload photos

### Medical Centre Admin
- Manage centre providers
- View centre analytics
- Manage centre bookings
- Set provider availability
- Track centre revenue

### Admin
- Approve/reject providers
- Moderate reviews
- View all bookings
- Financial oversight
- System configuration

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/send-otp` - Send OTP via WhatsApp
- `POST /api/auth/verify-otp` - Verify OTP and authenticate
- `GET /api/auth/me` - Get current user
- `POST /api/auth/update-role` - Update user role

### Providers
- `GET /api/providers` - List providers with filters
- `GET /api/providers/[id]` - Get provider details

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings` - Get user bookings
- `PATCH /api/bookings/[id]/status` - Update booking status

### Reviews
- `POST /api/reviews` - Submit review
- `GET /api/reviews?providerId=...` - Get provider reviews

### User
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile

### Provider App
- `GET /api/provider/profile` - Get provider profile
- `PATCH /api/provider/profile` - Update provider profile
- `GET /api/provider/stats` - Provider statistics
- `GET /api/provider/earnings` - Provider earnings
- `GET /api/provider/availability` - Get availability
- `POST /api/provider/availability` - Set availability

### Admin
- `GET /api/admin/providers/pending` - Pending providers
- `POST /api/admin/providers/[id]/approve` - Approve provider
- `POST /api/admin/providers/[id]/reject` - Reject provider
- `GET /api/admin/bookings` - All bookings
- `GET /api/admin/reviews` - All reviews
- `POST /api/admin/reviews/[id]/approve` - Approve review
- `POST /api/admin/reviews/[id]/reject` - Reject review
- `GET /api/admin/financials` - Financial reports
- `GET /api/admin/stats` - Admin statistics

### Medical Centre
- `GET /api/medical-centre/dashboard` - Centre dashboard
- `GET /api/medical-centre/providers` - Centre providers
- `GET /api/medical-centre/bookings` - Centre bookings
- `GET /api/medical-centre/analytics` - Centre analytics
- `POST /api/medical-centre/availability` - Set availability

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18.17 or later
- PostgreSQL database (Supabase recommended)
- Twilio account (for WhatsApp OTP)

### Installation

1. **Clone the repository**:
```bash
git clone <repository-url>
cd medicalHomeService
```

2. **Install dependencies**:
```bash
npm install
```

3. **Set up environment variables**:
Create `.env.local` file:
```bash
# Database
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"

# Authentication
JWT_SECRET="your-strong-random-secret-key"

# Twilio WhatsApp
TWILIO_ACCOUNT_SID="your-account-sid"
TWILIO_AUTH_TOKEN="your-auth-token"
TWILIO_WHATSAPP_FROM="whatsapp:+14155238886"
TWILIO_CONTENT_SID="your-content-template-sid"

# Environment
NODE_ENV="development"
```

4. **Set up database**:
```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev
```

5. **Start development server**:
```bash
npm run dev
```

6. **Open the application**:
Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Configuration

### Twilio WhatsApp Setup
1. Create Twilio account
2. Set up WhatsApp sandbox or get approved WhatsApp Business number
3. Create Content Template with OTP parameter
4. Add Content SID to environment variables
5. See `WHATSAPP_SETUP.md` for detailed instructions

### Database Setup
1. Create Supabase project or PostgreSQL database
2. Get connection string
3. Add to `DATABASE_URL` environment variable
4. Run Prisma migrations

## 🎨 UI/UX Features

- **RTL Support**: Full right-to-left layout for Arabic
- **Responsive Design**: Mobile-first, works on all devices
- **Modern UI**: Clean, professional design with Tailwind CSS
- **Toast Notifications**: User-friendly notifications with RTL support
- **Loading States**: Skeleton loaders and spinners
- **Error Handling**: Graceful error messages
- **Accessibility**: Semantic HTML and ARIA labels

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: API endpoints protected by role
- **Input Validation**: Zod schema validation on all inputs
- **SQL Injection Prevention**: Prisma ORM parameterized queries
- **XSS Prevention**: React's built-in XSS protection
- **Environment Variables**: Secrets stored in environment variables
- **OTP Expiration**: Time-limited OTP codes

## 📊 Key Metrics & Analytics

### Admin Dashboard
- Total providers
- Pending provider approvals
- Total bookings
- Today's revenue

### Provider Dashboard
- Today's bookings
- Pending bookings
- Total earnings
- Monthly earnings

### Medical Centre Dashboard
- Centre providers count
- Centre bookings
- Centre revenue
- Provider performance

## 🚢 Deployment

The application is configured for deployment on Vercel:

1. **Push to GitHub**: Code is automatically deployed
2. **Set Environment Variables**: Add all required env vars in Vercel dashboard
3. **Database**: Ensure Supabase connection is configured
4. **Build**: Vercel automatically runs `prisma generate && next build`

See `VERCEL_DEPLOYMENT.md` for detailed deployment instructions.

## 📝 Development Notes

### OTP Testing
- Currently hardcoded to `'123456'` for testing
- Remove hardcoding once Twilio WhatsApp is fully configured
- See `lib/auth.ts` for OTP generation

### Database
- Uses Prisma ORM with PostgreSQL
- Migrations in `prisma/migrations/`
- Schema in `prisma/schema.prisma`

### RTL Implementation
- All components use `dir="rtl"` for Arabic
- CSS Grid with `flex-row-reverse` for proper alignment
- Arabic date formatting with `ar-KW` locale

## 🐛 Known Issues / TODO

- [ ] Remove hardcoded OTP (currently '123456')
- [ ] Implement real KNET payment gateway
- [ ] Add push notifications (Firebase/OneSignal)
- [ ] Add image upload to cloud storage (AWS S3/Cloudinary)
- [ ] Add rate limiting to API endpoints
- [ ] Add comprehensive error logging
- [ ] Add unit and integration tests
- [ ] Add CI/CD pipeline
- [ ] Add security headers middleware

## 📄 License

Private - All rights reserved

## 👥 Support

For issues or questions, please contact the development team.
