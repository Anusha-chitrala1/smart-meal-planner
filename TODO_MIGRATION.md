# Backend to Next.js API Routes Migration

## Phase 1: Setup Structure
- [x] Create `lib/` directory for shared utilities
- [x] Create `app/api/` directory structure
- [x] Create `middleware.ts` for authentication

## Phase 2: Database & Models
- [x] Move database config to `lib/db.ts`
- [x] Move models to `lib/models/`
- [x] Update model imports throughout

## Phase 3: Authentication
- [x] Convert auth middleware to Next.js middleware
- [x] Create `/api/auth/[...nextauth]` or JWT-based auth routes
- [x] Move auth controllers to API routes

## Phase 4: API Routes
- [x] Convert `/api/meals` routes
- [x] Convert `/api/orders` routes
- [x] Convert `/api/support` routes
- [x] Convert `/api/auth` routes

## Phase 5: Utilities & Config
- [x] Move email utilities to `lib/`
- [x] Move seeder to `lib/`
- [x] Update package.json dependencies

## Phase 6: Frontend Updates
- [x] Update API calls from `http://localhost:5000/api/*` to `/api/*`
- [x] Update authentication handling
- [x] Test all functionality

## Phase 7: Cleanup
- [x] Remove Backend folder
- [ ] Update README
- [ ] Test deployment readiness
