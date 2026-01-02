"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobComplaintsRelations = exports.jobCardsRelations = exports.workshopsRelations = exports.customersRelations = exports.usersRelations = exports.vehicleOwnersRelations = exports.vehiclesRelations = exports.variantsRelations = exports.makesRelations = exports.modelsRelations = exports.slotBookings = exports.serviceBayMapping = exports.services = exports.bays = exports.expenses = exports.users = exports.workshopBreaks = exports.inventoryBatches = exports.payments = exports.invoices = exports.purchaseItems = exports.purchases = exports.suppliers = exports.inventoryPartNumbers = exports.inventoryVehicleMapping = exports.inventoryItems = exports.subCategories = exports.jobItems = exports.jobInspections = exports.categories = exports.jobParts = exports.workshops = exports.jobComplaints = exports.jobCards = exports.customers = exports.vehicleOwners = exports.vehicles = exports.variants = exports.models = exports.makes = exports.txnType = exports.slotStatus = exports.role = exports.paymentMode = exports.jobStage = exports.jobPriority = exports.invoiceType = exports.fuelType = exports.bayType = exports.approvalStatus = void 0;
exports.slotBookingsRelations = exports.serviceBayMappingRelations = exports.servicesRelations = exports.baysRelations = exports.expensesRelations = exports.workshopBreaksRelations = exports.paymentsRelations = exports.invoicesRelations = exports.purchaseItemsRelations = exports.purchasesRelations = exports.suppliersRelations = exports.inventoryPartNumbersRelations = exports.inventoryVehicleMappingRelations = exports.categoriesRelations = exports.subCategoriesRelations = exports.jobItemsRelations = exports.jobInspectionsRelations = exports.inventoryItemsRelations = exports.inventoryBatchesRelations = exports.jobPartsRelations = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const relations_1 = require("drizzle-orm/relations");
exports.approvalStatus = (0, pg_core_1.pgEnum)("ApprovalStatus", ['PENDING', 'APPROVED', 'REJECTED']);
exports.bayType = (0, pg_core_1.pgEnum)("BayType", ['SERVICE', 'WASHING', 'ALIGNMENT', 'ELECTRICAL', 'GENERAL']);
exports.fuelType = (0, pg_core_1.pgEnum)("FuelType", ['PETROL', 'DIESEL', 'CNG', 'ELECTRIC', 'HYBRID']);
exports.invoiceType = (0, pg_core_1.pgEnum)("InvoiceType", ['JOB_CARD', 'COUNTER_SALE']);
exports.jobPriority = (0, pg_core_1.pgEnum)("JobPriority", ['NORMAL', 'URGENT']);
exports.jobStage = (0, pg_core_1.pgEnum)("JobStage", ['CREATED', 'INSPECTION', 'ESTIMATE', 'CUSTOMER_APPROVAL', 'WORK_IN_PROGRESS', 'QC', 'BILLING', 'DELIVERY', 'CLOSED']);
exports.paymentMode = (0, pg_core_1.pgEnum)("PaymentMode", ['CASH', 'UPI', 'CARD', 'BANK_TRANSFER', 'CREDIT']);
exports.role = (0, pg_core_1.pgEnum)("Role", ['SUPER_ADMIN', 'WORKSHOP_ADMIN', 'WORKSHOP_MANAGER', 'TECHNICIAN', 'CLIENT', 'RSA_PROVIDER', 'SUPPLIER']);
exports.slotStatus = (0, pg_core_1.pgEnum)("SlotStatus", ['AVAILABLE', 'BOOKED', 'BLOCKED']);
exports.txnType = (0, pg_core_1.pgEnum)("TxnType", ['CREDIT', 'DEBIT']);
exports.makes = (0, pg_core_1.pgTable)("makes", {
    id: (0, pg_core_1.text)().primaryKey().notNull(),
    name: (0, pg_core_1.text)().notNull(),
}, (table) => [
    (0, pg_core_1.uniqueIndex)("makes_name_key").using("btree", table.name.asc().nullsLast().op("text_ops")),
]);
exports.models = (0, pg_core_1.pgTable)("models", {
    id: (0, pg_core_1.text)().primaryKey().notNull(),
    name: (0, pg_core_1.text)().notNull(),
    makeId: (0, pg_core_1.text)().notNull(),
}, (table) => [
    (0, pg_core_1.uniqueIndex)("models_makeId_name_key").using("btree", table.makeId.asc().nullsLast().op("text_ops"), table.name.asc().nullsLast().op("text_ops")),
    (0, pg_core_1.foreignKey)({
        columns: [table.makeId],
        foreignColumns: [exports.makes.id],
        name: "models_makeId_fkey"
    }).onUpdate("cascade").onDelete("restrict"),
]);
exports.variants = (0, pg_core_1.pgTable)("variants", {
    id: (0, pg_core_1.text)().primaryKey().notNull(),
    name: (0, pg_core_1.text)().notNull(),
    fuelType: (0, exports.fuelType)().notNull(),
    modelId: (0, pg_core_1.text)().notNull(),
}, (table) => [
    (0, pg_core_1.uniqueIndex)("variants_modelId_name_fuelType_key").using("btree", table.modelId.asc().nullsLast().op("enum_ops"), table.name.asc().nullsLast().op("text_ops"), table.fuelType.asc().nullsLast().op("enum_ops")),
    (0, pg_core_1.foreignKey)({
        columns: [table.modelId],
        foreignColumns: [exports.models.id],
        name: "variants_modelId_fkey"
    }).onUpdate("cascade").onDelete("restrict"),
]);
exports.vehicles = (0, pg_core_1.pgTable)("vehicles", {
    id: (0, pg_core_1.text)().primaryKey().notNull(),
    regNumber: (0, pg_core_1.text)().notNull(),
    chassisNumber: (0, pg_core_1.text)(),
    engineNumber: (0, pg_core_1.text)(),
    vin: (0, pg_core_1.text)(),
    mfgYear: (0, pg_core_1.integer)(),
    variantId: (0, pg_core_1.text)().notNull(),
    createdAt: (0, pg_core_1.timestamp)({ precision: 3, mode: 'string' }).default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`).notNull(),
    updatedAt: (0, pg_core_1.timestamp)({ precision: 3, mode: 'string' }).notNull(),
}, (table) => [
    (0, pg_core_1.uniqueIndex)("vehicles_regNumber_key").using("btree", table.regNumber.asc().nullsLast().op("text_ops")),
    (0, pg_core_1.foreignKey)({
        columns: [table.variantId],
        foreignColumns: [exports.variants.id],
        name: "vehicles_variantId_fkey"
    }).onUpdate("cascade").onDelete("restrict"),
]);
exports.vehicleOwners = (0, pg_core_1.pgTable)("vehicle_owners", {
    id: (0, pg_core_1.text)().primaryKey().notNull(),
    userId: (0, pg_core_1.text)().notNull(),
    vehicleId: (0, pg_core_1.text)().notNull(),
    isPrimary: (0, pg_core_1.boolean)().default(true).notNull(),
}, (table) => [
    (0, pg_core_1.uniqueIndex)("vehicle_owners_userId_vehicleId_key").using("btree", table.userId.asc().nullsLast().op("text_ops"), table.vehicleId.asc().nullsLast().op("text_ops")),
    (0, pg_core_1.foreignKey)({
        columns: [table.userId],
        foreignColumns: [exports.users.id],
        name: "vehicle_owners_userId_fkey"
    }).onUpdate("cascade").onDelete("restrict"),
    (0, pg_core_1.foreignKey)({
        columns: [table.vehicleId],
        foreignColumns: [exports.vehicles.id],
        name: "vehicle_owners_vehicleId_fkey"
    }).onUpdate("cascade").onDelete("restrict"),
]);
exports.customers = (0, pg_core_1.pgTable)("customers", {
    id: (0, pg_core_1.text)().primaryKey().notNull(),
    workshopId: (0, pg_core_1.text)().notNull(),
    name: (0, pg_core_1.text)().notNull(),
    mobile: (0, pg_core_1.text)().notNull(),
    email: (0, pg_core_1.text)(),
    address: (0, pg_core_1.text)(),
    gstin: (0, pg_core_1.text)(),
    createdAt: (0, pg_core_1.timestamp)({ precision: 3, mode: 'string' }).default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`).notNull(),
    updatedAt: (0, pg_core_1.timestamp)({ precision: 3, mode: 'string' }).notNull(),
}, (table) => [
    (0, pg_core_1.uniqueIndex)("customers_workshopId_mobile_key").using("btree", table.workshopId.asc().nullsLast().op("text_ops"), table.mobile.asc().nullsLast().op("text_ops")),
    (0, pg_core_1.foreignKey)({
        columns: [table.workshopId],
        foreignColumns: [exports.workshops.id],
        name: "customers_workshopId_fkey"
    }).onUpdate("cascade").onDelete("restrict"),
]);
exports.jobCards = (0, pg_core_1.pgTable)("job_cards", {
    id: (0, pg_core_1.text)().primaryKey().notNull(),
    workshopId: (0, pg_core_1.text)().notNull(),
    vehicleId: (0, pg_core_1.text)().notNull(),
    customerId: (0, pg_core_1.text)().notNull(),
    stage: (0, exports.jobStage)().default('CREATED').notNull(),
    priority: (0, exports.jobPriority)().default('NORMAL').notNull(),
    odometer: (0, pg_core_1.integer)(),
    fuelLevel: (0, pg_core_1.integer)(),
    entryTime: (0, pg_core_1.timestamp)({ precision: 3, mode: 'string' }).default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`).notNull(),
    estimatedDeliveryTime: (0, pg_core_1.timestamp)({ precision: 3, mode: 'string' }),
    actualDeliveryTime: (0, pg_core_1.timestamp)({ precision: 3, mode: 'string' }),
    advisorId: (0, pg_core_1.text)(),
    technicianId: (0, pg_core_1.text)(),
    createdAt: (0, pg_core_1.timestamp)({ precision: 3, mode: 'string' }).default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`).notNull(),
    updatedAt: (0, pg_core_1.timestamp)({ precision: 3, mode: 'string' }).notNull(),
}, (table) => [
    (0, pg_core_1.foreignKey)({
        columns: [table.customerId],
        foreignColumns: [exports.customers.id],
        name: "job_cards_customerId_fkey"
    }).onUpdate("cascade").onDelete("restrict"),
    (0, pg_core_1.foreignKey)({
        columns: [table.vehicleId],
        foreignColumns: [exports.vehicles.id],
        name: "job_cards_vehicleId_fkey"
    }).onUpdate("cascade").onDelete("restrict"),
    (0, pg_core_1.foreignKey)({
        columns: [table.workshopId],
        foreignColumns: [exports.workshops.id],
        name: "job_cards_workshopId_fkey"
    }).onUpdate("cascade").onDelete("restrict"),
]);
exports.jobComplaints = (0, pg_core_1.pgTable)("job_complaints", {
    id: (0, pg_core_1.text)().primaryKey().notNull(),
    jobCardId: (0, pg_core_1.text)().notNull(),
    complaint: (0, pg_core_1.text)().notNull(),
    remark: (0, pg_core_1.text)(),
}, (table) => [
    (0, pg_core_1.foreignKey)({
        columns: [table.jobCardId],
        foreignColumns: [exports.jobCards.id],
        name: "job_complaints_jobCardId_fkey"
    }).onUpdate("cascade").onDelete("restrict"),
]);
exports.workshops = (0, pg_core_1.pgTable)("workshops", {
    id: (0, pg_core_1.text)().primaryKey().notNull(),
    name: (0, pg_core_1.text)().notNull(),
    address: (0, pg_core_1.text)(),
    city: (0, pg_core_1.text)(),
    state: (0, pg_core_1.text)(),
    pincode: (0, pg_core_1.text)(),
    gstin: (0, pg_core_1.text)(),
    mobile: (0, pg_core_1.text)().notNull(),
    email: (0, pg_core_1.text)(),
    logoUrl: (0, pg_core_1.text)(),
    isActive: (0, pg_core_1.boolean)().default(true).notNull(),
    createdAt: (0, pg_core_1.timestamp)({ precision: 3, mode: 'string' }).default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`).notNull(),
    updatedAt: (0, pg_core_1.timestamp)({ precision: 3, mode: 'string' }).notNull(),
    latitude: (0, pg_core_1.doublePrecision)(),
    longitude: (0, pg_core_1.doublePrecision)(),
    workingStartHour: (0, pg_core_1.text)().default('09:00').notNull(),
    workingEndHour: (0, pg_core_1.text)().default('19:00').notNull(),
    slotDurationMin: (0, pg_core_1.integer)().default(30).notNull(),
    workingDays: (0, pg_core_1.text)().array().default(["RAY['MON'::text", "'TUE'::text", "'WED'::text", "'THU'::text", "'FRI'::text", "'SAT'::tex"]),
});
exports.jobParts = (0, pg_core_1.pgTable)("job_parts", {
    id: (0, pg_core_1.text)().primaryKey().notNull(),
    jobCardId: (0, pg_core_1.text)().notNull(),
    itemId: (0, pg_core_1.text)().notNull(),
    batchId: (0, pg_core_1.text)(),
    quantity: (0, pg_core_1.doublePrecision)().notNull(),
    unitPrice: (0, pg_core_1.doublePrecision)().notNull(),
    gstPercent: (0, pg_core_1.doublePrecision)().notNull(),
    totalPrice: (0, pg_core_1.doublePrecision)().notNull(),
    isApproved: (0, pg_core_1.boolean)().default(false).notNull(),
}, (table) => [
    (0, pg_core_1.foreignKey)({
        columns: [table.batchId],
        foreignColumns: [exports.inventoryBatches.id],
        name: "job_parts_batchId_fkey"
    }).onUpdate("cascade").onDelete("set null"),
    (0, pg_core_1.foreignKey)({
        columns: [table.itemId],
        foreignColumns: [exports.inventoryItems.id],
        name: "job_parts_itemId_fkey"
    }).onUpdate("cascade").onDelete("restrict"),
    (0, pg_core_1.foreignKey)({
        columns: [table.jobCardId],
        foreignColumns: [exports.jobCards.id],
        name: "job_parts_jobCardId_fkey"
    }).onUpdate("cascade").onDelete("restrict"),
]);
exports.categories = (0, pg_core_1.pgTable)("categories", {
    id: (0, pg_core_1.text)().primaryKey().notNull(),
    name: (0, pg_core_1.text)().notNull(),
});
exports.jobInspections = (0, pg_core_1.pgTable)("job_inspections", {
    id: (0, pg_core_1.text)().primaryKey().notNull(),
    jobCardId: (0, pg_core_1.text)().notNull(),
    exterior: (0, pg_core_1.jsonb)(),
    interior: (0, pg_core_1.jsonb)(),
    tyres: (0, pg_core_1.jsonb)(),
    battery: (0, pg_core_1.text)(),
    documents: (0, pg_core_1.jsonb)(),
    photos: (0, pg_core_1.text)().array(),
}, (table) => [
    (0, pg_core_1.uniqueIndex)("job_inspections_jobCardId_key").using("btree", table.jobCardId.asc().nullsLast().op("text_ops")),
    (0, pg_core_1.foreignKey)({
        columns: [table.jobCardId],
        foreignColumns: [exports.jobCards.id],
        name: "job_inspections_jobCardId_fkey"
    }).onUpdate("cascade").onDelete("restrict"),
]);
exports.jobItems = (0, pg_core_1.pgTable)("job_items", {
    id: (0, pg_core_1.text)().primaryKey().notNull(),
    jobCardId: (0, pg_core_1.text)().notNull(),
    description: (0, pg_core_1.text)().notNull(),
    price: (0, pg_core_1.doublePrecision)().notNull(),
    gstPercent: (0, pg_core_1.doublePrecision)().default(18).notNull(),
    isApproved: (0, pg_core_1.boolean)().default(false).notNull(),
    completionStatus: (0, pg_core_1.text)(),
}, (table) => [
    (0, pg_core_1.foreignKey)({
        columns: [table.jobCardId],
        foreignColumns: [exports.jobCards.id],
        name: "job_items_jobCardId_fkey"
    }).onUpdate("cascade").onDelete("restrict"),
]);
exports.subCategories = (0, pg_core_1.pgTable)("sub_categories", {
    id: (0, pg_core_1.text)().primaryKey().notNull(),
    categoryId: (0, pg_core_1.text)().notNull(),
    name: (0, pg_core_1.text)().notNull(),
}, (table) => [
    (0, pg_core_1.foreignKey)({
        columns: [table.categoryId],
        foreignColumns: [exports.categories.id],
        name: "sub_categories_categoryId_fkey"
    }).onUpdate("cascade").onDelete("restrict"),
]);
exports.inventoryItems = (0, pg_core_1.pgTable)("inventory_items", {
    id: (0, pg_core_1.text)().primaryKey().notNull(),
    workshopId: (0, pg_core_1.text)().notNull(),
    name: (0, pg_core_1.text)().notNull(),
    brand: (0, pg_core_1.text)(),
    isOem: (0, pg_core_1.boolean)().default(false).notNull(),
    hsnCode: (0, pg_core_1.text)(),
    taxPercent: (0, pg_core_1.doublePrecision)().default(18).notNull(),
    createdAt: (0, pg_core_1.timestamp)({ precision: 3, mode: 'string' }).default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`).notNull(),
    updatedAt: (0, pg_core_1.timestamp)({ precision: 3, mode: 'string' }).notNull(),
}, (table) => [
    (0, pg_core_1.foreignKey)({
        columns: [table.workshopId],
        foreignColumns: [exports.workshops.id],
        name: "inventory_items_workshopId_fkey"
    }).onUpdate("cascade").onDelete("restrict"),
]);
exports.inventoryVehicleMapping = (0, pg_core_1.pgTable)("inventory_vehicle_mapping", {
    id: (0, pg_core_1.text)().primaryKey().notNull(),
    itemId: (0, pg_core_1.text)().notNull(),
    modelId: (0, pg_core_1.text)().notNull(),
    variantId: (0, pg_core_1.text)(),
}, (table) => [
    (0, pg_core_1.foreignKey)({
        columns: [table.itemId],
        foreignColumns: [exports.inventoryItems.id],
        name: "inventory_vehicle_mapping_itemId_fkey"
    }).onUpdate("cascade").onDelete("restrict"),
    (0, pg_core_1.foreignKey)({
        columns: [table.modelId],
        foreignColumns: [exports.models.id],
        name: "inventory_vehicle_mapping_modelId_fkey"
    }).onUpdate("cascade").onDelete("restrict"),
]);
exports.inventoryPartNumbers = (0, pg_core_1.pgTable)("inventory_part_numbers", {
    id: (0, pg_core_1.text)().primaryKey().notNull(),
    itemId: (0, pg_core_1.text)().notNull(),
    skuCode: (0, pg_core_1.text)().notNull(),
}, (table) => [
    (0, pg_core_1.uniqueIndex)("inventory_part_numbers_itemId_skuCode_key").using("btree", table.itemId.asc().nullsLast().op("text_ops"), table.skuCode.asc().nullsLast().op("text_ops")),
    (0, pg_core_1.foreignKey)({
        columns: [table.itemId],
        foreignColumns: [exports.inventoryItems.id],
        name: "inventory_part_numbers_itemId_fkey"
    }).onUpdate("cascade").onDelete("restrict"),
]);
exports.suppliers = (0, pg_core_1.pgTable)("suppliers", {
    id: (0, pg_core_1.text)().primaryKey().notNull(),
    workshopId: (0, pg_core_1.text)().notNull(),
    name: (0, pg_core_1.text)().notNull(),
    mobile: (0, pg_core_1.text)().notNull(),
    gstin: (0, pg_core_1.text)(),
    address: (0, pg_core_1.text)(),
}, (table) => [
    (0, pg_core_1.foreignKey)({
        columns: [table.workshopId],
        foreignColumns: [exports.workshops.id],
        name: "suppliers_workshopId_fkey"
    }).onUpdate("cascade").onDelete("restrict"),
]);
exports.purchases = (0, pg_core_1.pgTable)("purchases", {
    id: (0, pg_core_1.text)().primaryKey().notNull(),
    workshopId: (0, pg_core_1.text)().notNull(),
    supplierId: (0, pg_core_1.text)().notNull(),
    invoiceDate: (0, pg_core_1.timestamp)({ precision: 3, mode: 'string' }).notNull(),
    invoiceNumber: (0, pg_core_1.text)(),
    totalAmount: (0, pg_core_1.doublePrecision)().notNull(),
    status: (0, pg_core_1.text)().notNull(),
    createdAt: (0, pg_core_1.timestamp)({ precision: 3, mode: 'string' }).default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
    (0, pg_core_1.foreignKey)({
        columns: [table.supplierId],
        foreignColumns: [exports.suppliers.id],
        name: "purchases_supplierId_fkey"
    }).onUpdate("cascade").onDelete("restrict"),
    (0, pg_core_1.foreignKey)({
        columns: [table.workshopId],
        foreignColumns: [exports.workshops.id],
        name: "purchases_workshopId_fkey"
    }).onUpdate("cascade").onDelete("restrict"),
]);
exports.purchaseItems = (0, pg_core_1.pgTable)("purchase_items", {
    id: (0, pg_core_1.text)().primaryKey().notNull(),
    orderId: (0, pg_core_1.text)().notNull(),
    itemName: (0, pg_core_1.text)().notNull(),
    partNumber: (0, pg_core_1.text)(),
    quantity: (0, pg_core_1.doublePrecision)().notNull(),
    unitCost: (0, pg_core_1.doublePrecision)().notNull(),
    taxPercent: (0, pg_core_1.doublePrecision)().notNull(),
    total: (0, pg_core_1.doublePrecision)().notNull(),
}, (table) => [
    (0, pg_core_1.foreignKey)({
        columns: [table.orderId],
        foreignColumns: [exports.purchases.id],
        name: "purchase_items_orderId_fkey"
    }).onUpdate("cascade").onDelete("restrict"),
]);
exports.invoices = (0, pg_core_1.pgTable)("invoices", {
    id: (0, pg_core_1.text)().primaryKey().notNull(),
    workshopId: (0, pg_core_1.text)().notNull(),
    customerId: (0, pg_core_1.text)().notNull(),
    jobCardId: (0, pg_core_1.text)(),
    invoiceNumber: (0, pg_core_1.text)().notNull(),
    invoiceDate: (0, pg_core_1.timestamp)({ precision: 3, mode: 'string' }).default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`).notNull(),
    type: (0, exports.invoiceType)().notNull(),
    totalLabor: (0, pg_core_1.doublePrecision)().default(0).notNull(),
    totalParts: (0, pg_core_1.doublePrecision)().default(0).notNull(),
    cgst: (0, pg_core_1.doublePrecision)().default(0).notNull(),
    sgst: (0, pg_core_1.doublePrecision)().default(0).notNull(),
    igst: (0, pg_core_1.doublePrecision)().default(0).notNull(),
    discount: (0, pg_core_1.doublePrecision)().default(0).notNull(),
    grandTotal: (0, pg_core_1.doublePrecision)().notNull(),
    paidAmount: (0, pg_core_1.doublePrecision)().default(0).notNull(),
    balance: (0, pg_core_1.doublePrecision)().default(0).notNull(),
}, (table) => [
    (0, pg_core_1.uniqueIndex)("invoices_jobCardId_key").using("btree", table.jobCardId.asc().nullsLast().op("text_ops")),
    (0, pg_core_1.foreignKey)({
        columns: [table.customerId],
        foreignColumns: [exports.customers.id],
        name: "invoices_customerId_fkey"
    }).onUpdate("cascade").onDelete("restrict"),
    (0, pg_core_1.foreignKey)({
        columns: [table.jobCardId],
        foreignColumns: [exports.jobCards.id],
        name: "invoices_jobCardId_fkey"
    }).onUpdate("cascade").onDelete("set null"),
    (0, pg_core_1.foreignKey)({
        columns: [table.workshopId],
        foreignColumns: [exports.workshops.id],
        name: "invoices_workshopId_fkey"
    }).onUpdate("cascade").onDelete("restrict"),
]);
exports.payments = (0, pg_core_1.pgTable)("payments", {
    id: (0, pg_core_1.text)().primaryKey().notNull(),
    invoiceId: (0, pg_core_1.text)().notNull(),
    amount: (0, pg_core_1.doublePrecision)().notNull(),
    mode: (0, exports.paymentMode)().notNull(),
    reference: (0, pg_core_1.text)(),
    date: (0, pg_core_1.timestamp)({ precision: 3, mode: 'string' }).default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
    (0, pg_core_1.foreignKey)({
        columns: [table.invoiceId],
        foreignColumns: [exports.invoices.id],
        name: "payments_invoiceId_fkey"
    }).onUpdate("cascade").onDelete("restrict"),
]);
exports.inventoryBatches = (0, pg_core_1.pgTable)("inventory_batches", {
    id: (0, pg_core_1.text)().primaryKey().notNull(),
    itemId: (0, pg_core_1.text)().notNull(),
    batchNumber: (0, pg_core_1.text)(),
    expiryDate: (0, pg_core_1.timestamp)({ precision: 3, mode: 'string' }),
    quantity: (0, pg_core_1.doublePrecision)().notNull(),
    purchasePrice: (0, pg_core_1.doublePrecision)().notNull(),
    salePrice: (0, pg_core_1.doublePrecision)().notNull(),
    purchasedAt: (0, pg_core_1.timestamp)({ precision: 3, mode: 'string' }).default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
    (0, pg_core_1.foreignKey)({
        columns: [table.itemId],
        foreignColumns: [exports.inventoryItems.id],
        name: "inventory_batches_itemId_fkey"
    }).onUpdate("cascade").onDelete("restrict"),
]);
exports.workshopBreaks = (0, pg_core_1.pgTable)("workshop_breaks", {
    id: (0, pg_core_1.text)().primaryKey().notNull(),
    workshopId: (0, pg_core_1.text)().notNull(),
    title: (0, pg_core_1.text)().notNull(),
    startTime: (0, pg_core_1.text)().notNull(),
    endTime: (0, pg_core_1.text)().notNull(),
}, (table) => [
    (0, pg_core_1.foreignKey)({
        columns: [table.workshopId],
        foreignColumns: [exports.workshops.id],
        name: "workshop_breaks_workshopId_fkey"
    }).onUpdate("cascade").onDelete("restrict"),
]);
exports.users = (0, pg_core_1.pgTable)("users", {
    id: (0, pg_core_1.text)().primaryKey().notNull(),
    email: (0, pg_core_1.text)(),
    mobile: (0, pg_core_1.text)().notNull(),
    password: (0, pg_core_1.text)(),
    role: (0, exports.role)().notNull(),
    name: (0, pg_core_1.text)(),
    createdAt: (0, pg_core_1.timestamp)({ precision: 3, mode: 'string' }).default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`).notNull(),
    updatedAt: (0, pg_core_1.timestamp)({ precision: 3, mode: 'string' }).notNull(),
    workshopId: (0, pg_core_1.text)(),
}, (table) => [
    (0, pg_core_1.uniqueIndex)("users_email_key").using("btree", table.email.asc().nullsLast().op("text_ops")),
    (0, pg_core_1.uniqueIndex)("users_mobile_key").using("btree", table.mobile.asc().nullsLast().op("text_ops")),
    (0, pg_core_1.foreignKey)({
        columns: [table.workshopId],
        foreignColumns: [exports.workshops.id],
        name: "users_workshopId_fkey"
    }).onUpdate("cascade").onDelete("set null"),
]);
exports.expenses = (0, pg_core_1.pgTable)("expenses", {
    id: (0, pg_core_1.text)().primaryKey().notNull(),
    workshopId: (0, pg_core_1.text)().notNull(),
    category: (0, pg_core_1.text)().notNull(),
    amount: (0, pg_core_1.doublePrecision)().notNull(),
    date: (0, pg_core_1.timestamp)({ precision: 3, mode: 'string' }).notNull(),
    notes: (0, pg_core_1.text)(),
    attachmentUrl: (0, pg_core_1.text)(),
}, (table) => [
    (0, pg_core_1.foreignKey)({
        columns: [table.workshopId],
        foreignColumns: [exports.workshops.id],
        name: "expenses_workshopId_fkey"
    }).onUpdate("cascade").onDelete("restrict"),
]);
exports.bays = (0, pg_core_1.pgTable)("bays", {
    id: (0, pg_core_1.text)().primaryKey().notNull(),
    workshopId: (0, pg_core_1.text)().notNull(),
    name: (0, pg_core_1.text)().notNull(),
    type: (0, exports.bayType)().notNull(),
    isActive: (0, pg_core_1.boolean)().default(true).notNull(),
}, (table) => [
    (0, pg_core_1.foreignKey)({
        columns: [table.workshopId],
        foreignColumns: [exports.workshops.id],
        name: "bays_workshopId_fkey"
    }).onUpdate("cascade").onDelete("restrict"),
]);
exports.services = (0, pg_core_1.pgTable)("services", {
    id: (0, pg_core_1.text)().primaryKey().notNull(),
    workshopId: (0, pg_core_1.text)().notNull(),
    name: (0, pg_core_1.text)().notNull(),
    durationMin: (0, pg_core_1.integer)().default(30).notNull(),
    price: (0, pg_core_1.doublePrecision)(),
}, (table) => [
    (0, pg_core_1.foreignKey)({
        columns: [table.workshopId],
        foreignColumns: [exports.workshops.id],
        name: "services_workshopId_fkey"
    }).onUpdate("cascade").onDelete("restrict"),
]);
exports.serviceBayMapping = (0, pg_core_1.pgTable)("service_bay_mapping", {
    id: (0, pg_core_1.text)().primaryKey().notNull(),
    serviceId: (0, pg_core_1.text)().notNull(),
    bayId: (0, pg_core_1.text)().notNull(),
}, (table) => [
    (0, pg_core_1.uniqueIndex)("service_bay_mapping_serviceId_bayId_key").using("btree", table.serviceId.asc().nullsLast().op("text_ops"), table.bayId.asc().nullsLast().op("text_ops")),
    (0, pg_core_1.foreignKey)({
        columns: [table.bayId],
        foreignColumns: [exports.bays.id],
        name: "service_bay_mapping_bayId_fkey"
    }).onUpdate("cascade").onDelete("restrict"),
    (0, pg_core_1.foreignKey)({
        columns: [table.serviceId],
        foreignColumns: [exports.services.id],
        name: "service_bay_mapping_serviceId_fkey"
    }).onUpdate("cascade").onDelete("restrict"),
]);
exports.slotBookings = (0, pg_core_1.pgTable)("slot_bookings", {
    id: (0, pg_core_1.text)().primaryKey().notNull(),
    bayId: (0, pg_core_1.text)().notNull(),
    date: (0, pg_core_1.timestamp)({ precision: 3, mode: 'string' }).notNull(),
    startTime: (0, pg_core_1.text)().notNull(),
    endTime: (0, pg_core_1.text)().notNull(),
    status: (0, exports.slotStatus)().notNull(),
    jobCardId: (0, pg_core_1.text)(),
    createdAt: (0, pg_core_1.timestamp)({ precision: 3, mode: 'string' }).default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
    (0, pg_core_1.foreignKey)({
        columns: [table.bayId],
        foreignColumns: [exports.bays.id],
        name: "slot_bookings_bayId_fkey"
    }).onUpdate("cascade").onDelete("restrict"),
]);
exports.modelsRelations = (0, relations_1.relations)(exports.models, ({ one, many }) => ({
    make: one(exports.makes, {
        fields: [exports.models.makeId],
        references: [exports.makes.id]
    }),
    variants: many(exports.variants),
    inventoryVehicleMappings: many(exports.inventoryVehicleMapping),
}));
exports.makesRelations = (0, relations_1.relations)(exports.makes, ({ many }) => ({
    models: many(exports.models),
}));
exports.variantsRelations = (0, relations_1.relations)(exports.variants, ({ one, many }) => ({
    model: one(exports.models, {
        fields: [exports.variants.modelId],
        references: [exports.models.id]
    }),
    vehicles: many(exports.vehicles),
}));
exports.vehiclesRelations = (0, relations_1.relations)(exports.vehicles, ({ one, many }) => ({
    variant: one(exports.variants, {
        fields: [exports.vehicles.variantId],
        references: [exports.variants.id]
    }),
    vehicleOwners: many(exports.vehicleOwners),
    jobCards: many(exports.jobCards),
}));
exports.vehicleOwnersRelations = (0, relations_1.relations)(exports.vehicleOwners, ({ one }) => ({
    user: one(exports.users, {
        fields: [exports.vehicleOwners.userId],
        references: [exports.users.id]
    }),
    vehicle: one(exports.vehicles, {
        fields: [exports.vehicleOwners.vehicleId],
        references: [exports.vehicles.id]
    }),
}));
exports.usersRelations = (0, relations_1.relations)(exports.users, ({ one, many }) => ({
    vehicleOwners: many(exports.vehicleOwners),
    workshop: one(exports.workshops, {
        fields: [exports.users.workshopId],
        references: [exports.workshops.id]
    }),
}));
exports.customersRelations = (0, relations_1.relations)(exports.customers, ({ one, many }) => ({
    workshop: one(exports.workshops, {
        fields: [exports.customers.workshopId],
        references: [exports.workshops.id]
    }),
    jobCards: many(exports.jobCards),
    invoices: many(exports.invoices),
}));
exports.workshopsRelations = (0, relations_1.relations)(exports.workshops, ({ many }) => ({
    customers: many(exports.customers),
    jobCards: many(exports.jobCards),
    inventoryItems: many(exports.inventoryItems),
    suppliers: many(exports.suppliers),
    purchases: many(exports.purchases),
    invoices: many(exports.invoices),
    workshopBreaks: many(exports.workshopBreaks),
    users: many(exports.users),
    expenses: many(exports.expenses),
    bays: many(exports.bays),
    services: many(exports.services),
}));
exports.jobCardsRelations = (0, relations_1.relations)(exports.jobCards, ({ one, many }) => ({
    customer: one(exports.customers, {
        fields: [exports.jobCards.customerId],
        references: [exports.customers.id]
    }),
    vehicle: one(exports.vehicles, {
        fields: [exports.jobCards.vehicleId],
        references: [exports.vehicles.id]
    }),
    workshop: one(exports.workshops, {
        fields: [exports.jobCards.workshopId],
        references: [exports.workshops.id]
    }),
    jobComplaints: many(exports.jobComplaints),
    jobParts: many(exports.jobParts),
    jobInspections: many(exports.jobInspections),
    jobItems: many(exports.jobItems),
    invoices: many(exports.invoices),
}));
exports.jobComplaintsRelations = (0, relations_1.relations)(exports.jobComplaints, ({ one }) => ({
    jobCard: one(exports.jobCards, {
        fields: [exports.jobComplaints.jobCardId],
        references: [exports.jobCards.id]
    }),
}));
exports.jobPartsRelations = (0, relations_1.relations)(exports.jobParts, ({ one }) => ({
    inventoryBatch: one(exports.inventoryBatches, {
        fields: [exports.jobParts.batchId],
        references: [exports.inventoryBatches.id]
    }),
    inventoryItem: one(exports.inventoryItems, {
        fields: [exports.jobParts.itemId],
        references: [exports.inventoryItems.id]
    }),
    jobCard: one(exports.jobCards, {
        fields: [exports.jobParts.jobCardId],
        references: [exports.jobCards.id]
    }),
}));
exports.inventoryBatchesRelations = (0, relations_1.relations)(exports.inventoryBatches, ({ one, many }) => ({
    jobParts: many(exports.jobParts),
    inventoryItem: one(exports.inventoryItems, {
        fields: [exports.inventoryBatches.itemId],
        references: [exports.inventoryItems.id]
    }),
}));
exports.inventoryItemsRelations = (0, relations_1.relations)(exports.inventoryItems, ({ one, many }) => ({
    jobParts: many(exports.jobParts),
    workshop: one(exports.workshops, {
        fields: [exports.inventoryItems.workshopId],
        references: [exports.workshops.id]
    }),
    inventoryVehicleMappings: many(exports.inventoryVehicleMapping),
    inventoryPartNumbers: many(exports.inventoryPartNumbers),
    inventoryBatches: many(exports.inventoryBatches),
}));
exports.jobInspectionsRelations = (0, relations_1.relations)(exports.jobInspections, ({ one }) => ({
    jobCard: one(exports.jobCards, {
        fields: [exports.jobInspections.jobCardId],
        references: [exports.jobCards.id]
    }),
}));
exports.jobItemsRelations = (0, relations_1.relations)(exports.jobItems, ({ one }) => ({
    jobCard: one(exports.jobCards, {
        fields: [exports.jobItems.jobCardId],
        references: [exports.jobCards.id]
    }),
}));
exports.subCategoriesRelations = (0, relations_1.relations)(exports.subCategories, ({ one }) => ({
    category: one(exports.categories, {
        fields: [exports.subCategories.categoryId],
        references: [exports.categories.id]
    }),
}));
exports.categoriesRelations = (0, relations_1.relations)(exports.categories, ({ many }) => ({
    subCategories: many(exports.subCategories),
}));
exports.inventoryVehicleMappingRelations = (0, relations_1.relations)(exports.inventoryVehicleMapping, ({ one }) => ({
    inventoryItem: one(exports.inventoryItems, {
        fields: [exports.inventoryVehicleMapping.itemId],
        references: [exports.inventoryItems.id]
    }),
    model: one(exports.models, {
        fields: [exports.inventoryVehicleMapping.modelId],
        references: [exports.models.id]
    }),
}));
exports.inventoryPartNumbersRelations = (0, relations_1.relations)(exports.inventoryPartNumbers, ({ one }) => ({
    inventoryItem: one(exports.inventoryItems, {
        fields: [exports.inventoryPartNumbers.itemId],
        references: [exports.inventoryItems.id]
    }),
}));
exports.suppliersRelations = (0, relations_1.relations)(exports.suppliers, ({ one, many }) => ({
    workshop: one(exports.workshops, {
        fields: [exports.suppliers.workshopId],
        references: [exports.workshops.id]
    }),
    purchases: many(exports.purchases),
}));
exports.purchasesRelations = (0, relations_1.relations)(exports.purchases, ({ one, many }) => ({
    supplier: one(exports.suppliers, {
        fields: [exports.purchases.supplierId],
        references: [exports.suppliers.id]
    }),
    workshop: one(exports.workshops, {
        fields: [exports.purchases.workshopId],
        references: [exports.workshops.id]
    }),
    purchaseItems: many(exports.purchaseItems),
}));
exports.purchaseItemsRelations = (0, relations_1.relations)(exports.purchaseItems, ({ one }) => ({
    purchase: one(exports.purchases, {
        fields: [exports.purchaseItems.orderId],
        references: [exports.purchases.id]
    }),
}));
exports.invoicesRelations = (0, relations_1.relations)(exports.invoices, ({ one, many }) => ({
    customer: one(exports.customers, {
        fields: [exports.invoices.customerId],
        references: [exports.customers.id]
    }),
    jobCard: one(exports.jobCards, {
        fields: [exports.invoices.jobCardId],
        references: [exports.jobCards.id]
    }),
    workshop: one(exports.workshops, {
        fields: [exports.invoices.workshopId],
        references: [exports.workshops.id]
    }),
    payments: many(exports.payments),
}));
exports.paymentsRelations = (0, relations_1.relations)(exports.payments, ({ one }) => ({
    invoice: one(exports.invoices, {
        fields: [exports.payments.invoiceId],
        references: [exports.invoices.id]
    }),
}));
exports.workshopBreaksRelations = (0, relations_1.relations)(exports.workshopBreaks, ({ one }) => ({
    workshop: one(exports.workshops, {
        fields: [exports.workshopBreaks.workshopId],
        references: [exports.workshops.id]
    }),
}));
exports.expensesRelations = (0, relations_1.relations)(exports.expenses, ({ one }) => ({
    workshop: one(exports.workshops, {
        fields: [exports.expenses.workshopId],
        references: [exports.workshops.id]
    }),
}));
exports.baysRelations = (0, relations_1.relations)(exports.bays, ({ one, many }) => ({
    workshop: one(exports.workshops, {
        fields: [exports.bays.workshopId],
        references: [exports.workshops.id]
    }),
    serviceBayMappings: many(exports.serviceBayMapping),
    slotBookings: many(exports.slotBookings),
}));
exports.servicesRelations = (0, relations_1.relations)(exports.services, ({ one, many }) => ({
    workshop: one(exports.workshops, {
        fields: [exports.services.workshopId],
        references: [exports.workshops.id]
    }),
    serviceBayMappings: many(exports.serviceBayMapping),
}));
exports.serviceBayMappingRelations = (0, relations_1.relations)(exports.serviceBayMapping, ({ one }) => ({
    bay: one(exports.bays, {
        fields: [exports.serviceBayMapping.bayId],
        references: [exports.bays.id]
    }),
    service: one(exports.services, {
        fields: [exports.serviceBayMapping.serviceId],
        references: [exports.services.id]
    }),
}));
exports.slotBookingsRelations = (0, relations_1.relations)(exports.slotBookings, ({ one }) => ({
    bay: one(exports.bays, {
        fields: [exports.slotBookings.bayId],
        references: [exports.bays.id]
    }),
}));
//# sourceMappingURL=schema.js.map