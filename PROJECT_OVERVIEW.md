# Motract SaaS - Project Overview

## Project Structure

This is a **monorepo SaaS application** for automotive workshop management with the following structure:

### Backend (NestJS + Prisma)
- **Location**: `/backend`
- **Framework**: NestJS v11
- **Database**: PostgreSQL with Prisma ORM
- **Language**: TypeScript
- **Deployment**: Render.com (configured in `render.yaml`)

### Frontend Apps (Flutter)
- **Location**: `/apps`
- **4 Flutter Applications**:
  1. **client** - Customer-facing mobile app
  2. **rsa** - Roadside assistance provider app
  3. **super_admin** - Super admin management app
  4. **workshop** - Workshop management app

---

## Backend Architecture

### Modules Overview

1. **Auth Module** (`/src/auth`)
   - User registration and login
   - JWT authentication strategy
   - Password hashing with bcrypt

2. **Users Module** (`/src/users`)
   - User management service

3. **Vehicle Module** (`/src/vehicle`)
   - Global vehicle registry
   - Vehicle master data (Make, Model, Variant)
   - Vehicle registration and lookup

4. **Job Card Module** (`/src/job-card`)
   - Job card creation and management
   - Job stages tracking (CREATED → CLOSED)
   - Customer complaints, tasks, parts tracking

5. **Inventory Module** (`/src/inventory`)
   - Inventory item management
   - SKU management
   - Batch tracking with FIFO and expiry dates
   - Vehicle compatibility mapping

6. **Billing Module** (`/src/billing`)
   - Invoice generation for job cards
   - GST calculation (CGST/SGST/IGST)
   - Payment tracking

7. **Purchase Module** (`/src/purchase`)
   - Supplier management
   - Purchase order creation and tracking
   - Supplier ledger

8. **Slot Module** (`/src/slot`)
   - Bay management
   - Slot booking system
   - Service-bay mapping

9. **Dashboard Module** (`/src/dashboard`)
   - KPI metrics
   - Job status funnel
   - Revenue graphs
   - Top services analytics

10. **Prisma Module** (`/src/prisma`)
    - Database connection service

### Database Schema (Prisma)

**Key Models:**
- `User` - Multi-role authentication (SUPER_ADMIN, WORKSHOP_ADMIN, TECHNICIAN, CLIENT, RSA_PROVIDER, SUPPLIER)
- `Workshop` - Workshop information and settings
- `Make`, `VehicleModel`, `Variant` - Global vehicle hierarchy
- `Vehicle` - Global vehicle registry
- `Customer` - Workshop-specific customers
- `JobCard` - Service job tracking
- `JobTask`, `JobPart`, `JobComplaint` - Job details
- `InventoryItem`, `InventorySku`, `InventoryBatch` - Inventory management
- `Supplier`, `PurchaseOrder` - Procurement
- `Invoice`, `Payment` - Billing and payments
- `Bay`, `Service`, `SlotBooking` - Slot management

---

## Issues Fixed

### ✅ Backend TypeScript Errors

1. **auth.controller.ts** (Line 10)
   - **Issue**: Parameter 'body' implicitly has an 'any' type
   - **Fix**: Added explicit type annotation: `{ mobile: string; password: string }`

2. **billing.service.ts** (Line 22-25)
   - **Issue**: Property 'price' does not exist on JobPart type
   - **Fix**: Changed to use `part.totalPrice` (correct field from schema)

3. **billing.service.ts** (Line 36)
   - **Issue**: 'invoiceType' does not exist (should be 'type' per Prisma schema)
   - **Fix**: Changed to `type: InvoiceType.JOB_CARD`
   - **Additional Fix**: Updated invoice creation to match Prisma schema fields:
     - `totalLabor`, `totalParts` instead of `totalAmount`
     - `grandTotal` instead of `totalAmount`
     - `balance` instead of `balanceAmount`
     - Removed invalid `status` field
     - Added required `invoiceNumber` field

### ✅ Flutter Client App Syntax Errors

1. **apps/client/lib/main.dart** (Line 31)
   - **Issue**: `colorScheme: .fromSeed(...)` - missing `ColorScheme`
   - **Fix**: `colorScheme: ColorScheme.fromSeed(...)`

2. **apps/client/lib/main.dart** (Line 105)
   - **Issue**: `mainAxisAlignment: .center` - missing `MainAxisAlignment`
   - **Fix**: `mainAxisAlignment: MainAxisAlignment.center`

---

## Configuration Files

### Backend
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration (strict mode enabled)
- `nest-cli.json` - NestJS CLI configuration
- `eslint.config.mjs` - ESLint configuration
- `prisma/schema.prisma` - Database schema
- `render.yaml` - Render.com deployment configuration

### Deployment
- `render.yaml` - Backend service configuration
  - Build: `cd backend && npm install && npx prisma generate && npm run build`
  - Start: `cd backend && node dist/src/main`
  - Database: PostgreSQL (free tier)
  - Port: 10000

### Environment
- `setup_env.js` - Script to generate `.env` file for backend
- **Note**: Contains hardcoded database credentials (should use environment variables in production)

---

## API Documentation

Comprehensive API test documentation is available in:
- `backend/API_TESTS.md`

**Base URL**: `https://motract-backend.onrender.com`

### Test Workflows:
1. Complete Workshop Setup & Job Card Flow
2. Inventory & Purchase Management
3. Dashboard KPIs
4. Slot Booking

---

## Flutter Apps Status

All 4 Flutter apps appear to be **starter templates** with:
- Basic Flutter setup
- Standard boilerplate code
- Minimal dependencies (only `cupertino_icons`)
- Cross-platform support (Android, iOS, Web, Windows, Linux, macOS)

**Next Steps for Flutter Apps:**
- Add HTTP client (e.g., `dio` or `http`)
- Add state management (e.g., `flutter_bloc`, `provider`, or `riverpod`)
- Add UI dependencies (e.g., `flutter_svg`, `cached_network_image`)
- Implement API integration with backend
- Design application-specific UI/UX

---

## Known Issues & Recommendations

### Backend

1. **Missing DTOs/Validation**
   - Controllers use `any` types
   - No class-validator DTOs
   - **Recommendation**: Add DTOs with validation pipes

2. **Authentication Guards**
   - JWT strategy exists but not applied to protected routes
   - **Recommendation**: Add `@UseGuards(JwtAuthGuard)` to protected endpoints

3. **Error Handling**
   - Inconsistent error responses
   - **Recommendation**: Implement global exception filter

4. **Invoice Number Generation**
   - Currently uses timestamp
   - **Recommendation**: Implement sequential invoice numbering per workshop

5. **Database Connection**
   - Hardcoded credentials in `setup_env.js`
   - **Recommendation**: Use environment variables only

### Flutter Apps

1. **Starter Templates**
   - All apps are default Flutter templates
   - **Recommendation**: Begin implementing actual features

2. **State Management**
   - No state management solution
   - **Recommendation**: Choose and implement state management

3. **API Integration**
   - No HTTP client configured
   - **Recommendation**: Set up API service layer

---

## Build & Development

### Backend

```bash
cd backend
npm install
npx prisma generate
npm run build
npm run start:dev  # Development
npm run start:prod # Production
```

### Flutter Apps

```bash
cd apps/[app_name]
flutter pub get
flutter run
```

---

## Testing

### Backend
- Unit tests: `npm run test`
- E2E tests: `npm run test:e2e`
- Test scripts available: `test-api.js`, `test-api.ps1`, `test-api.sh`

### Flutter
- Widget tests available in each app's `/test` directory

---

## Project Status Summary

### ✅ Completed
- Backend architecture and modules
- Database schema design
- TypeScript build errors fixed
- Flutter client app syntax errors fixed
- API documentation
- Deployment configuration

### 🚧 In Progress / Needs Work
- Flutter app implementations
- API DTOs and validation
- Authentication guards implementation
- Error handling standardization
- Invoice numbering system

### 📋 Recommended Next Steps
1. Implement DTOs with validation for all endpoints
2. Add authentication guards to protected routes
3. Implement sequential invoice numbering
4. Start developing Flutter app features
5. Set up CI/CD pipeline
6. Add comprehensive error handling
7. Write unit and integration tests

---

**Last Updated**: Generated on project review
**Project Type**: SaaS Multi-tenant Workshop Management System
**Tech Stack**: NestJS, Prisma, PostgreSQL, Flutter

