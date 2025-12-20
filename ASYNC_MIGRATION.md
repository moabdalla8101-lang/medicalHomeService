# Async Database Migration Guide

## Important: All Database Methods Are Now Async

All database operations in `lib/db.ts` are now **async** and return Promises. You must use `await` when calling them.

## Before (In-Memory):
```typescript
const user = db.getUserById(id);
const provider = db.getProviderProfile(providerId);
db.createBooking(booking);
```

## After (Prisma):
```typescript
const user = await db.getUserById(id);
const provider = await db.getProviderProfile(providerId);
await db.createBooking(booking);
```

## Files That Need Updates

All files that use `db.*` methods need to be updated to use `await`. Key files:

1. **lib/auth.ts** - All db calls need await
2. **lib/bookingService.ts** - All db calls need await  
3. **lib/paymentService.ts** - All db calls need await
4. **lib/seedData.ts** - All db calls need await
5. **All API routes** - All db calls need await

## Example Migration

### lib/auth.ts
```typescript
// Before
let user = db.getUserByPhone(normalizedPhone);

// After
let user = await db.getUserByPhone(normalizedPhone);
```

### lib/bookingService.ts
```typescript
// Before
export function createBooking(params: CreateBookingParams): Booking {
  const config = db.getSystemConfig();
  const provider = db.getProviderProfile(params.providerId);
  // ...
}

// After
export async function createBooking(params: CreateBookingParams): Promise<Booking> {
  const config = await db.getSystemConfig();
  const provider = await db.getProviderProfile(params.providerId);
  // ...
}
```

## Quick Fix Script

You can use find/replace in your editor:
- Find: `db.`
- Replace: `await db.` (but be careful - only in async functions!)

Better approach: Update each file systematically.

## Testing

After updating, test:
1. User authentication
2. Provider profile creation
3. Booking creation
4. Payment processing
5. All API endpoints



