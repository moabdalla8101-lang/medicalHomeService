# Remaining API Routes to Update

The following API routes need to be updated to use `await` for all database operations:

## Pattern to Follow:

**Before:**
```typescript
const user = requireAuth(authHeader);
const profile = db.getProviderProfile(id);
const bookings = db.getUserBookings(userId);
```

**After:**
```typescript
const user = await requireAuth(authHeader);
const profile = await db.getProviderProfile(id);
const bookings = await db.getUserBookings(userId);
```

## Files to Update:

1. `app/api/provider/profile/route.ts`
2. `app/api/provider/stats/route.ts`
3. `app/api/provider/earnings/route.ts`
4. `app/api/provider/upload-photo/route.ts`
5. `app/api/admin/providers/list/route.ts`
6. `app/api/admin/providers/pending/route.ts`
7. `app/api/admin/providers/[id]/approve/route.ts`
8. `app/api/admin/providers/[id]/reject/route.ts`
9. `app/api/admin/bookings/route.ts`
10. `app/api/admin/financials/route.ts`
11. `app/api/admin/settings/route.ts`
12. `app/api/admin/reviews/route.ts`
13. `app/api/admin/reviews/[id]/approve/route.ts`
14. `app/api/admin/reviews/[id]/reject/route.ts`
15. `app/api/admin/seed/route.ts`
16. `app/api/providers/route.ts`
17. `app/api/providers/[id]/route.ts`
18. `app/api/reviews/route.ts`
19. `app/api/notifications/route.ts`
20. `app/api/payments/initiate/route.ts`
21. `app/api/payments/process/route.ts`
22. `app/api/provider/availability/route.ts`

## Quick Find & Replace:

1. Find: `requireAuth(authHeader)`
   Replace: `await requireAuth(authHeader)`

2. Find: `db.` (in async functions)
   Replace: `await db.` (but be careful - only in async functions!)

## Testing:

After updating, test all endpoints to ensure they work correctly with the async database.

