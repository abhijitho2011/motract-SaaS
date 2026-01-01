# Motract Backend - Comprehensive API Test Suite

This document provides complete API workflow tests for all modules.

## Setup

```bash
BASE_URL="https://motract-backend.onrender.com"
```

## Test Workflow 1: Complete Workshop Setup & Job Card Flow

### Step 1: Register Workshop Admin
```bash
POST $BASE_URL/auth/register
{
  "mobile": "9876543210",
  "password": "admin123",
  "role": "WORKSHOP_ADMIN",
  "name": "Test Workshop Admin"
}
```

### Step 2: Login
```bash
POST $BASE_URL/auth/login
{
  "mobile": "9876543210",
  "password": "admin123"
}
# Save access_token for subsequent requests
```

### Step 3: Get Vehicle Masters
```bash
GET $BASE_URL/vehicle/masters/models
# Returns all Makes, Models, and Variants
# Pick a variantId for vehicle registration
```

### Step 4: Register a Vehicle
```bash
POST $BASE_URL/vehicle/register
{
  "regNumber": "KA01AB1234",
  "variantId": "<variant-id-from-step-3>",
  "mfgYear": 2020,
  "chassisNumber": "CH123456789",
  "engineNumber": "EN987654321",
  "vin": "VIN1234567890"
}
```

### Step 5: Lookup Vehicle
```bash
GET $BASE_URL/vehicle/lookup/KA01AB1234
# Should return vehicle with Make, Model, Variant details
```

### Step 6: Create Customer (Workshop-specific)
```bash
# Note: Customer creation is embedded in Job Card creation
# Or create via dedicated endpoint if implemented
```

### Step 7: Create Job Card
```bash
POST $BASE_URL/job-cards
{
  "workshopId": "<workshop-id>",
  "vehicleRegNumber": "KA01AB1234",
  "customerId": "<customer-id>",
  "odometer": 15000,
  "fuelLevel": 75,
  "complaints": ["Engine noise", "AC not cooling"],
  "priority": "NORMAL"
}
# Save jobCardId
```

### Step 8: Get Job Card Details
```bash
GET $BASE_URL/job-cards/<jobCardId>
# Returns full job card with vehicle, customer, complaints
```

### Step 9: Update Job Card Stage
```bash
PATCH $BASE_URL/job-cards/<jobCardId>/stage
{
  "stage": "WORK_IN_PROGRESS"
}
```

### Step 10: Generate Invoice
```bash
POST $BASE_URL/billing/invoice/job-card/<jobCardId>
# Auto-calculates GST and totals
```

---

## Test Workflow 2: Inventory & Purchase Management

### Step 1: Create Supplier
```bash
POST $BASE_URL/purchase/suppliers
{
  "workshopId": "<workshop-id>",
  "name": "ABC Auto Parts",
  "mobile": "9988776655",
  "gstin": "29ABCDE1234F1Z5",
  "address": "123 Main St, City"
}
# Save supplierId
```

### Step 2: Create Purchase Order
```bash
POST $BASE_URL/purchase/orders
{
  "workshopId": "<workshop-id>",
  "supplierId": "<supplier-id>",
  "invoiceDate": "2024-01-15",
  "invoiceNumber": "INV-001",
  "items": [
    {
      "itemName": "Engine Oil 5W30",
      "partNumber": "CAST-5W30-4L",
      "quantity": 10,
      "unitCost": 450,
      "taxPercent": 18
    },
    {
      "itemName": "Oil Filter",
      "partNumber": "OF-123",
      "quantity": 20,
      "unitCost": 150,
      "taxPercent": 18
    }
  ]
}
# Save purchaseOrderId
```

### Step 3: Get Purchase Order
```bash
GET $BASE_URL/purchase/orders/<purchaseOrderId>
```

### Step 4: Update PO Status
```bash
PATCH $BASE_URL/purchase/orders/<purchaseOrderId>/status
{
  "status": "RECEIVED"
}
```

### Step 5: Create Inventory Item
```bash
POST $BASE_URL/inventory/items
{
  "workshopId": "<workshop-id>",
  "name": "Engine Oil 5W30",
  "brand": "Castrol",
  "isOem": true,
  "hsnCode": "271019",
  "taxPercent": 18
}
# Save itemId
```

### Step 6: Add SKU
```bash
POST $BASE_URL/inventory/items/<itemId>/skus
{
  "skuCode": "CAST-5W30-4L"
}
```

### Step 7: Add Batch
```bash
POST $BASE_URL/inventory/items/<itemId>/batches
{
  "quantity": 50,
  "purchasePrice": 450,
  "salePrice": 650,
  "batchNumber": "B2024001",
  "expiryDate": "2025-12-31"
}
```

### Step 8: Get All Inventory
```bash
GET $BASE_URL/inventory/items?workshopId=<workshop-id>
```

### Step 9: Get Supplier Ledger
```bash
GET $BASE_URL/purchase/suppliers/<supplierId>/ledger
# Returns total purchases, pending orders, order history
```

---

## Test Workflow 3: Dashboard KPIs

### Step 1: Get Dashboard KPIs
```bash
GET $BASE_URL/dashboard/kpis?workshopId=<workshop-id>
# Returns:
# - vehiclesIn (today)
# - jobsInProgress
# - jobsCompleted (today)
# - pendingDeliveries
# - pendingApprovals
# - pendingPayments
# - revenue (today)
# - lowStockCount
# - lowStockItems
```

### Step 2: Get Job Status Funnel
```bash
GET $BASE_URL/dashboard/job-funnel?workshopId=<workshop-id>
# Returns count of jobs in each stage
```

### Step 3: Get Revenue Graph
```bash
GET $BASE_URL/dashboard/revenue-graph?workshopId=<workshop-id>&days=7
# Returns daily revenue for last 7 days
```

### Step 4: Get Top Services
```bash
GET $BASE_URL/dashboard/top-services?workshopId=<workshop-id>&limit=5
# Returns top 5 services by count and revenue
```

---

## Test Workflow 4: Slot Booking

### Step 1: Create Bay
```bash
POST $BASE_URL/slots/bays
{
  "workshopId": "<workshop-id>",
  "name": "Bay 1",
  "type": "SERVICE",
  "isActive": true
}
# Save bayId
```

### Step 2: Get All Bays
```bash
GET $BASE_URL/slots/bays?workshopId=<workshop-id>
```

### Step 3: Book Slot
```bash
POST $BASE_URL/slots/book
{
  "bayId": "<bay-id>",
  "date": "2024-01-20",
  "startTime": "10:00",
  "endTime": "11:00",
  "status": "BOOKED",
  "jobCardId": "<job-card-id>"
}
```

---

## Expected Results Summary

### Auth Module
- ✅ User registration creates user with hashed password
- ✅ Login returns JWT token and user object
- ✅ Token can be used for authenticated requests

### Vehicle Registry
- ✅ Masters endpoint returns all seeded Makes/Models/Variants
- ✅ Vehicle registration creates global vehicle record
- ✅ Lookup returns vehicle with full hierarchy

### Job Cards
- ✅ Job card creation links vehicle and customer
- ✅ Stage updates track job lifecycle
- ✅ Full details include complaints, tasks, parts

### Inventory
- ✅ Items support multiple SKUs
- ✅ Batches track FIFO with expiry
- ✅ Stock levels updated on consumption

### Purchase Orders
- ✅ POs calculate totals with tax
- ✅ Supplier ledger aggregates all transactions
- ✅ Status tracking (DRAFT → RECEIVED)

### Dashboard
- ✅ Real-time KPIs from database
- ✅ Job funnel shows distribution
- ✅ Revenue graph shows trends
- ✅ Top services ranked by usage

### Slots
- ✅ Bays can be created and managed
- ✅ Slots can be booked with job card link
- ✅ Status tracking (AVAILABLE/BOOKED/BLOCKED)

---

## Notes

1. **Workshop ID**: Create a workshop first or use existing workshop ID from user registration
2. **Customer ID**: Create customers via workshop-specific endpoint
3. **Authentication**: Most endpoints should be protected with JWT guards (to be implemented)
4. **Validation**: Add DTOs with class-validator for production
5. **Error Handling**: Standardize error responses across all modules
