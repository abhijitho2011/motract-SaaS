import { pgTable, uniqueIndex, text, foreignKey, integer, timestamp, boolean, doublePrecision, jsonb, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"
import { relations } from "drizzle-orm/relations";

export const approvalStatus = pgEnum("ApprovalStatus", ['PENDING', 'APPROVED', 'REJECTED'])
export const bayType = pgEnum("BayType", ['SERVICE', 'WASHING', 'ALIGNMENT', 'ELECTRICAL', 'GENERAL'])
export const fuelType = pgEnum("FuelType", ['PETROL', 'DIESEL', 'CNG', 'ELECTRIC', 'HYBRID'])
export const invoiceType = pgEnum("InvoiceType", ['JOB_CARD', 'COUNTER_SALE'])
export const jobPriority = pgEnum("JobPriority", ['NORMAL', 'URGENT'])
export const jobStage = pgEnum("JobStage", ['CREATED', 'INSPECTION', 'ESTIMATE', 'CUSTOMER_APPROVAL', 'WORK_IN_PROGRESS', 'QC', 'BILLING', 'DELIVERY', 'CLOSED'])
export const paymentMode = pgEnum("PaymentMode", ['CASH', 'UPI', 'CARD', 'BANK_TRANSFER', 'CREDIT'])
export const role = pgEnum("Role", ['SUPER_ADMIN', 'WORKSHOP_ADMIN', 'WORKSHOP_MANAGER', 'TECHNICIAN', 'CLIENT', 'RSA_PROVIDER', 'SUPPLIER'])
export const slotStatus = pgEnum("SlotStatus", ['AVAILABLE', 'BOOKED', 'BLOCKED'])
export const txnType = pgEnum("TxnType", ['CREDIT', 'DEBIT'])
export const accountType = pgEnum("AccountType", ['WORKSHOP', 'SUPPLIER', 'RSA', 'REBUILD_CENTER'])
export const bookingStatus = pgEnum("BookingStatus", ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'])


export const makes = pgTable("makes", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
}, (table) => [
	uniqueIndex("makes_name_key").using("btree", table.name.asc().nullsLast().op("text_ops")),
]);

export const models = pgTable("models", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	makeId: text().notNull(),
}, (table) => [
	uniqueIndex("models_makeId_name_key").using("btree", table.makeId.asc().nullsLast().op("text_ops"), table.name.asc().nullsLast().op("text_ops")),
	foreignKey({
		columns: [table.makeId],
		foreignColumns: [makes.id],
		name: "models_makeId_fkey"
	}).onUpdate("cascade").onDelete("restrict"),
]);

export const variants = pgTable("variants", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	fuelType: fuelType().notNull(),
	modelId: text().notNull(),
}, (table) => [
	uniqueIndex("variants_modelId_name_fuelType_key").using("btree", table.modelId.asc().nullsLast().op("enum_ops"), table.name.asc().nullsLast().op("text_ops"), table.fuelType.asc().nullsLast().op("enum_ops")),
	foreignKey({
		columns: [table.modelId],
		foreignColumns: [models.id],
		name: "variants_modelId_fkey"
	}).onUpdate("cascade").onDelete("restrict"),
]);

export const vehicles = pgTable("vehicles", {
	id: text().primaryKey().notNull(),
	regNumber: text().notNull(),
	chassisNumber: text(),
	engineNumber: text(),
	vin: text(),
	mfgYear: integer(),
	variantId: text().notNull(),
	workshopId: text(), // Optional for now to support legacy data
	pollutionExpiryDate: timestamp({ mode: 'string' }),
	insuranceExpiryDate: timestamp({ mode: 'string' }),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
}, (table) => [
	uniqueIndex("vehicles_regNumber_key").using("btree", table.regNumber.asc().nullsLast().op("text_ops")),
	foreignKey({
		columns: [table.variantId],
		foreignColumns: [variants.id],
		name: "vehicles_variantId_fkey"
	}).onUpdate("cascade").onDelete("restrict"),
	foreignKey({
		columns: [table.workshopId],
		foreignColumns: [workshops.id],
		name: "vehicles_workshopId_fkey"
	}).onUpdate("cascade").onDelete("set null"),
]);

export const vehicleOwners = pgTable("vehicle_owners", {
	id: text().primaryKey().notNull(),
	userId: text().notNull(),
	vehicleId: text().notNull(),
	isPrimary: boolean().default(true).notNull(),
}, (table) => [
	uniqueIndex("vehicle_owners_userId_vehicleId_key").using("btree", table.userId.asc().nullsLast().op("text_ops"), table.vehicleId.asc().nullsLast().op("text_ops")),
	foreignKey({
		columns: [table.userId],
		foreignColumns: [users.id],
		name: "vehicle_owners_userId_fkey"
	}).onUpdate("cascade").onDelete("restrict"),
	foreignKey({
		columns: [table.vehicleId],
		foreignColumns: [vehicles.id],
		name: "vehicle_owners_vehicleId_fkey"
	}).onUpdate("cascade").onDelete("restrict"),
]);

export const customers = pgTable("customers", {
	id: text().primaryKey().notNull(),
	workshopId: text().notNull(),
	name: text().notNull(),
	mobile: text().notNull(),
	email: text(),
	address: text(),
	gstin: text(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
}, (table) => [
	uniqueIndex("customers_workshopId_mobile_key").using("btree", table.workshopId.asc().nullsLast().op("text_ops"), table.mobile.asc().nullsLast().op("text_ops")),
	foreignKey({
		columns: [table.workshopId],
		foreignColumns: [workshops.id],
		name: "customers_workshopId_fkey"
	}).onUpdate("cascade").onDelete("restrict"),
]);

export const jobCards = pgTable("job_cards", {
	id: text().primaryKey().notNull(),
	jobCardNumber: text(),
	workshopId: text().notNull(),
	vehicleId: text().notNull(),
	customerId: text().notNull(),
	stage: jobStage().default('CREATED').notNull(),
	priority: jobPriority().default('NORMAL').notNull(),
	odometer: integer(),
	fuelLevel: integer(),
	entryTime: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	estimatedDeliveryTime: timestamp({ precision: 3, mode: 'string' }),
	actualDeliveryTime: timestamp({ precision: 3, mode: 'string' }),
	advisorId: text(),
	technicianId: text(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
}, (table) => [
	foreignKey({
		columns: [table.customerId],
		foreignColumns: [customers.id],
		name: "job_cards_customerId_fkey"
	}).onUpdate("cascade").onDelete("restrict"),
	foreignKey({
		columns: [table.vehicleId],
		foreignColumns: [vehicles.id],
		name: "job_cards_vehicleId_fkey"
	}).onUpdate("cascade").onDelete("restrict"),
	foreignKey({
		columns: [table.workshopId],
		foreignColumns: [workshops.id],
		name: "job_cards_workshopId_fkey"
	}).onUpdate("cascade").onDelete("restrict"),
]);

export const jobComplaints = pgTable("job_complaints", {
	id: text().primaryKey().notNull(),
	jobCardId: text().notNull(),
	complaint: text().notNull(),
	remark: text(),
}, (table) => [
	foreignKey({
		columns: [table.jobCardId],
		foreignColumns: [jobCards.id],
		name: "job_complaints_jobCardId_fkey"
	}).onUpdate("cascade").onDelete("restrict"),
]);

export const workshops = pgTable("workshops", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	address: text(),
	city: text(),
	state: text(),
	pincode: text(),
	gstin: text(),
	mobile: text().notNull(),
	email: text(),
	logoUrl: text(),
	isActive: boolean().default(true).notNull(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
	latitude: doublePrecision(),
	longitude: doublePrecision(),
	workingStartHour: text().default('09:00').notNull(),
	workingEndHour: text().default('19:00').notNull(),
	slotDurationMin: integer().default(30).notNull(),
	workingDays: text().array().default(["RAY['MON'::text", "'TUE'::text", "'WED'::text", "'THU'::text", "'FRI'::text", "'SAT'::tex"]),
});

// Super Admin System Tables
export const accountTypes = pgTable("account_types", {
	id: text().primaryKey().notNull(),
	name: accountType().notNull(),
	description: text(),
});

export const organizations = pgTable("organizations", {
	id: text().primaryKey().notNull(),
	accountType: accountType().notNull(),
	subCategory: text(), // For RSA: Recovery Truck, Mobile Mechanic, etc.
	businessName: text().notNull(),
	name: text().notNull(), // Kept for backward compatibility
	email: text().notNull(),
	phone: text().notNull(),
	address: text().notNull(),
	city: text(),
	state: text(),
	pincode: text(),
	gstin: text(),
	latitude: doublePrecision(), // For map view
	longitude: doublePrecision(), // For map view
	isAuthorized: boolean().default(false).notNull(),
	isActive: boolean().default(true).notNull(),
	createdBy: text(), // Super admin ID who created this
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
}, (table) => [
	uniqueIndex("organizations_email_key").using("btree", table.email.asc().nullsLast().op("text_ops")),
]);

export const serviceCategories = pgTable("service_categories", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	description: text(),
	canHaveSubCategories: boolean().default(false).notNull(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	uniqueIndex("service_categories_name_key").using("btree", table.name.asc().nullsLast().op("text_ops")),
]);

export const serviceSubCategories = pgTable("service_sub_categories", {
	id: text().primaryKey().notNull(),
	categoryId: text().notNull(),
	name: text().notNull(),
	description: text(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	uniqueIndex("service_sub_categories_categoryId_name_key").using("btree", table.categoryId.asc().nullsLast().op("text_ops"), table.name.asc().nullsLast().op("text_ops")),
	foreignKey({
		columns: [table.categoryId],
		foreignColumns: [serviceCategories.id],
		name: "service_sub_categories_categoryId_fkey"
	}).onUpdate("cascade").onDelete("cascade"),
]);

export const superAdmins = pgTable("super_admins", {
	id: text().primaryKey().notNull(),
	userId: text().notNull(),
	name: text().notNull(),
	email: text().notNull(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	uniqueIndex("super_admins_userId_key").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	uniqueIndex("super_admins_email_key").using("btree", table.email.asc().nullsLast().op("text_ops")),
	foreignKey({
		columns: [table.userId],
		foreignColumns: [users.id],
		name: "super_admins_userId_fkey"
	}).onUpdate("cascade").onDelete("restrict"),
]);

export const onlineBookings = pgTable("online_bookings", {
	id: text().primaryKey().notNull(),
	organizationId: text().notNull(),
	customerName: text().notNull(),
	customerMobile: text().notNull(),
	customerEmail: text(),
	vehicleRegNumber: text(),
	serviceType: text(),
	scheduledDate: timestamp({ precision: 3, mode: 'string' }),
	status: bookingStatus().default('PENDING').notNull(),
	notes: text(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
}, (table) => [
	foreignKey({
		columns: [table.organizationId],
		foreignColumns: [organizations.id],
		name: "online_bookings_organizationId_fkey"
	}).onUpdate("cascade").onDelete("restrict"),
]);

export const jobParts = pgTable("job_parts", {
	id: text().primaryKey().notNull(),
	jobCardId: text().notNull(),
	itemId: text().notNull(),
	batchId: text(),
	quantity: doublePrecision().notNull(),
	unitPrice: doublePrecision().notNull(),
	gstPercent: doublePrecision().notNull(),
	totalPrice: doublePrecision().notNull(),
	isApproved: boolean().default(false).notNull(),
}, (table) => [
	foreignKey({
		columns: [table.batchId],
		foreignColumns: [inventoryBatches.id],
		name: "job_parts_batchId_fkey"
	}).onUpdate("cascade").onDelete("set null"),
	foreignKey({
		columns: [table.itemId],
		foreignColumns: [inventoryItems.id],
		name: "job_parts_itemId_fkey"
	}).onUpdate("cascade").onDelete("restrict"),
	foreignKey({
		columns: [table.jobCardId],
		foreignColumns: [jobCards.id],
		name: "job_parts_jobCardId_fkey"
	}).onUpdate("cascade").onDelete("restrict"),
]);

export const categories = pgTable("categories", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
});

export const brands = pgTable("brands", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
});

export const jobInspections = pgTable("job_inspections", {
	id: text().primaryKey().notNull(),
	jobCardId: text().notNull(),
	exterior: jsonb(),
	interior: jsonb(),
	tyres: jsonb(),
	battery: text(),
	documents: jsonb(),
	photos: text().array(),
}, (table) => [
	uniqueIndex("job_inspections_jobCardId_key").using("btree", table.jobCardId.asc().nullsLast().op("text_ops")),
	foreignKey({
		columns: [table.jobCardId],
		foreignColumns: [jobCards.id],
		name: "job_inspections_jobCardId_fkey"
	}).onUpdate("cascade").onDelete("restrict"),
]);

export const jobItems = pgTable("job_items", {
	id: text().primaryKey().notNull(),
	jobCardId: text().notNull(),
	description: text().notNull(),
	price: doublePrecision().notNull(),
	gstPercent: doublePrecision().default(18).notNull(),
	isApproved: boolean().default(false).notNull(),
	completionStatus: text(),
}, (table) => [
	foreignKey({
		columns: [table.jobCardId],
		foreignColumns: [jobCards.id],
		name: "job_items_jobCardId_fkey"
	}).onUpdate("cascade").onDelete("restrict"),
]);

export const subCategories = pgTable("sub_categories", {
	id: text().primaryKey().notNull(),
	categoryId: text().notNull(),
	name: text().notNull(),
}, (table) => [
	foreignKey({
		columns: [table.categoryId],
		foreignColumns: [categories.id],
		name: "sub_categories_categoryId_fkey"
	}).onUpdate("cascade").onDelete("restrict"),
]);

export const inventoryItems = pgTable("inventory_items", {
	id: text().primaryKey().notNull(),
	workshopId: text().notNull(),
	name: text().notNull(),
	brand: text(),
	isOem: boolean().default(false).notNull(),
	hsnCode: text(),
	taxPercent: doublePrecision().default(18).notNull(),
	reorderLevel: integer().default(0).notNull(),
	categoryId: text().notNull(),
	subCategoryId: text(),
	description: text(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
}, (table) => [
	foreignKey({
		columns: [table.workshopId],
		foreignColumns: [workshops.id],
		name: "inventory_items_workshopId_fkey"
	}).onUpdate("cascade").onDelete("restrict"),
	foreignKey({
		columns: [table.categoryId],
		foreignColumns: [categories.id],
		name: "inventory_items_categoryId_fkey"
	}).onUpdate("cascade").onDelete("restrict"),
	foreignKey({
		columns: [table.subCategoryId],
		foreignColumns: [subCategories.id],
		name: "inventory_items_subCategoryId_fkey"
	}).onUpdate("cascade").onDelete("set null"),
]);

export const inventoryVehicleMapping = pgTable("inventory_vehicle_mapping", {
	id: text().primaryKey().notNull(),
	itemId: text().notNull(),
	modelId: text().notNull(),
	variantId: text(),
}, (table) => [
	foreignKey({
		columns: [table.itemId],
		foreignColumns: [inventoryItems.id],
		name: "inventory_vehicle_mapping_itemId_fkey"
	}).onUpdate("cascade").onDelete("restrict"),
	foreignKey({
		columns: [table.modelId],
		foreignColumns: [models.id],
		name: "inventory_vehicle_mapping_modelId_fkey"
	}).onUpdate("cascade").onDelete("restrict"),
]);

export const inventoryPartNumbers = pgTable("inventory_part_numbers", {
	id: text().primaryKey().notNull(),
	itemId: text().notNull(),
	skuCode: text().notNull(),
}, (table) => [
	uniqueIndex("inventory_part_numbers_itemId_skuCode_key").using("btree", table.itemId.asc().nullsLast().op("text_ops"), table.skuCode.asc().nullsLast().op("text_ops")),
	foreignKey({
		columns: [table.itemId],
		foreignColumns: [inventoryItems.id],
		name: "inventory_part_numbers_itemId_fkey"
	}).onUpdate("cascade").onDelete("restrict"),
]);

export const suppliers = pgTable("suppliers", {
	id: text().primaryKey().notNull(),
	workshopId: text().notNull(),
	name: text().notNull(),
	mobile: text().notNull(),
	gstin: text(),
	address: text(),
	email: text(),
}, (table) => [
	foreignKey({
		columns: [table.workshopId],
		foreignColumns: [workshops.id],
		name: "suppliers_workshopId_fkey"
	}).onUpdate("cascade").onDelete("restrict"),
]);

export const inspectionMasters = pgTable("inspection_masters", {
	id: text().primaryKey().notNull(),
	workshopId: text().notNull(),
	category: text().notNull(),
	name: text().notNull(),
	isActive: boolean().default(true).notNull(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	foreignKey({
		columns: [table.workshopId],
		foreignColumns: [workshops.id],
		name: "inspection_masters_workshopId_fkey"
	}).onUpdate("cascade").onDelete("restrict"),
]);

export const purchases = pgTable("purchases", {
	id: text().primaryKey().notNull(),
	workshopId: text().notNull(),
	supplierId: text().notNull(),
	invoiceDate: timestamp({ precision: 3, mode: 'string' }).notNull(),
	invoiceNumber: text(),
	totalAmount: doublePrecision().notNull(),
	status: text().notNull(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	foreignKey({
		columns: [table.supplierId],
		foreignColumns: [suppliers.id],
		name: "purchases_supplierId_fkey"
	}).onUpdate("cascade").onDelete("restrict"),
	foreignKey({
		columns: [table.workshopId],
		foreignColumns: [workshops.id],
		name: "purchases_workshopId_fkey"
	}).onUpdate("cascade").onDelete("restrict"),
]);

export const purchaseItems = pgTable("purchase_items", {
	id: text().primaryKey().notNull(),
	orderId: text().notNull(),
	itemName: text().notNull(),
	partNumber: text(),
	quantity: doublePrecision().notNull(),
	unitCost: doublePrecision().notNull(),
	taxPercent: doublePrecision().notNull(),
	total: doublePrecision().notNull(),
}, (table) => [
	foreignKey({
		columns: [table.orderId],
		foreignColumns: [purchases.id],
		name: "purchase_items_orderId_fkey"
	}).onUpdate("cascade").onDelete("restrict"),
]);

export const invoices = pgTable("invoices", {
	id: text().primaryKey().notNull(),
	workshopId: text().notNull(),
	customerId: text().notNull(),
	jobCardId: text(),
	invoiceNumber: text().notNull(),
	invoiceDate: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	type: invoiceType().notNull(),
	totalLabor: doublePrecision().default(0).notNull(),
	totalParts: doublePrecision().default(0).notNull(),
	cgst: doublePrecision().default(0).notNull(),
	sgst: doublePrecision().default(0).notNull(),
	igst: doublePrecision().default(0).notNull(),
	discount: doublePrecision().default(0).notNull(),
	grandTotal: doublePrecision().notNull(),
	paidAmount: doublePrecision().default(0).notNull(),
	balance: doublePrecision().default(0).notNull(),
}, (table) => [
	uniqueIndex("invoices_jobCardId_key").using("btree", table.jobCardId.asc().nullsLast().op("text_ops")),
	foreignKey({
		columns: [table.customerId],
		foreignColumns: [customers.id],
		name: "invoices_customerId_fkey"
	}).onUpdate("cascade").onDelete("restrict"),
	foreignKey({
		columns: [table.jobCardId],
		foreignColumns: [jobCards.id],
		name: "invoices_jobCardId_fkey"
	}).onUpdate("cascade").onDelete("set null"),
	foreignKey({
		columns: [table.workshopId],
		foreignColumns: [workshops.id],
		name: "invoices_workshopId_fkey"
	}).onUpdate("cascade").onDelete("restrict"),
]);

export const payments = pgTable("payments", {
	id: text().primaryKey().notNull(),
	invoiceId: text().notNull(),
	amount: doublePrecision().notNull(),
	mode: paymentMode().notNull(),
	reference: text(),
	date: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	foreignKey({
		columns: [table.invoiceId],
		foreignColumns: [invoices.id],
		name: "payments_invoiceId_fkey"
	}).onUpdate("cascade").onDelete("restrict"),
]);

export const inventoryBatches = pgTable("inventory_batches", {
	id: text().primaryKey().notNull(),
	itemId: text().notNull(),
	batchNumber: text(),
	expiryDate: timestamp({ precision: 3, mode: 'string' }),
	quantity: doublePrecision().notNull(),
	purchasePrice: doublePrecision().notNull(),
	salePrice: doublePrecision().notNull(),
	purchasedAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	foreignKey({
		columns: [table.itemId],
		foreignColumns: [inventoryItems.id],
		name: "inventory_batches_itemId_fkey"
	}).onUpdate("cascade").onDelete("restrict"),
]);

export const workshopBreaks = pgTable("workshop_breaks", {
	id: text().primaryKey().notNull(),
	workshopId: text().notNull(),
	title: text().notNull(),
	startTime: text().notNull(),
	endTime: text().notNull(),
}, (table) => [
	foreignKey({
		columns: [table.workshopId],
		foreignColumns: [workshops.id],
		name: "workshop_breaks_workshopId_fkey"
	}).onUpdate("cascade").onDelete("restrict"),
]);

export const users = pgTable("users", {
	id: text().primaryKey().notNull(),
	email: text(),
	mobile: text().notNull(),
	password: text(),
	role: role().notNull(),
	name: text(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
	workshopId: text(),
}, (table) => [
	uniqueIndex("users_email_key").using("btree", table.email.asc().nullsLast().op("text_ops")),
	uniqueIndex("users_mobile_key").using("btree", table.mobile.asc().nullsLast().op("text_ops")),
	foreignKey({
		columns: [table.workshopId],
		foreignColumns: [workshops.id],
		name: "users_workshopId_fkey"
	}).onUpdate("cascade").onDelete("set null"),
]);

export const expenses = pgTable("expenses", {
	id: text().primaryKey().notNull(),
	workshopId: text().notNull(),
	category: text().notNull(),
	amount: doublePrecision().notNull(),
	date: timestamp({ precision: 3, mode: 'string' }).notNull(),
	notes: text(),
	attachmentUrl: text(),
}, (table) => [
	foreignKey({
		columns: [table.workshopId],
		foreignColumns: [workshops.id],
		name: "expenses_workshopId_fkey"
	}).onUpdate("cascade").onDelete("restrict"),
]);

export const bays = pgTable("bays", {
	id: text().primaryKey().notNull(),
	workshopId: text().notNull(),
	name: text().notNull(),
	type: bayType().notNull(),
	isActive: boolean().default(true).notNull(),
}, (table) => [
	foreignKey({
		columns: [table.workshopId],
		foreignColumns: [workshops.id],
		name: "bays_workshopId_fkey"
	}).onUpdate("cascade").onDelete("restrict"),
]);

export const services = pgTable("services", {
	id: text().primaryKey().notNull(),
	workshopId: text().notNull(),
	name: text().notNull(),
	durationMin: integer().default(30).notNull(),
	price: doublePrecision(),
}, (table) => [
	foreignKey({
		columns: [table.workshopId],
		foreignColumns: [workshops.id],
		name: "services_workshopId_fkey"
	}).onUpdate("cascade").onDelete("restrict"),
]);

export const serviceBayMapping = pgTable("service_bay_mapping", {
	id: text().primaryKey().notNull(),
	serviceId: text().notNull(),
	bayId: text().notNull(),
}, (table) => [
	uniqueIndex("service_bay_mapping_serviceId_bayId_key").using("btree", table.serviceId.asc().nullsLast().op("text_ops"), table.bayId.asc().nullsLast().op("text_ops")),
	foreignKey({
		columns: [table.bayId],
		foreignColumns: [bays.id],
		name: "service_bay_mapping_bayId_fkey"
	}).onUpdate("cascade").onDelete("restrict"),
	foreignKey({
		columns: [table.serviceId],
		foreignColumns: [services.id],
		name: "service_bay_mapping_serviceId_fkey"
	}).onUpdate("cascade").onDelete("restrict"),
]);

export const slotBookings = pgTable("slot_bookings", {
	id: text().primaryKey().notNull(),
	bayId: text().notNull(),
	date: timestamp({ precision: 3, mode: 'string' }).notNull(),
	startTime: text().notNull(),
	endTime: text().notNull(),
	status: slotStatus().notNull(),
	jobCardId: text(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	foreignKey({
		columns: [table.bayId],
		foreignColumns: [bays.id],
		name: "slot_bookings_bayId_fkey"
	}).onUpdate("cascade").onDelete("restrict"),
]);
export const modelsRelations = relations(models, ({ one, many }) => ({
	make: one(makes, {
		fields: [models.makeId],
		references: [makes.id]
	}),
	variants: many(variants),
	inventoryVehicleMappings: many(inventoryVehicleMapping),
}));

export const makesRelations = relations(makes, ({ many }) => ({
	models: many(models),
}));

export const variantsRelations = relations(variants, ({ one, many }) => ({
	model: one(models, {
		fields: [variants.modelId],
		references: [models.id]
	}),
	vehicles: many(vehicles),
}));

export const vehiclesRelations = relations(vehicles, ({ one, many }) => ({
	variant: one(variants, {
		fields: [vehicles.variantId],
		references: [variants.id]
	}),
	workshop: one(workshops, {
		fields: [vehicles.workshopId],
		references: [workshops.id]
	}),
	vehicleOwners: many(vehicleOwners),
	jobCards: many(jobCards),
}));

export const vehicleOwnersRelations = relations(vehicleOwners, ({ one }) => ({
	user: one(users, {
		fields: [vehicleOwners.userId],
		references: [users.id]
	}),
	vehicle: one(vehicles, {
		fields: [vehicleOwners.vehicleId],
		references: [vehicles.id]
	}),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
	vehicleOwners: many(vehicleOwners),
	workshop: one(workshops, {
		fields: [users.workshopId],
		references: [workshops.id]
	}),
}));

export const customersRelations = relations(customers, ({ one, many }) => ({
	workshop: one(workshops, {
		fields: [customers.workshopId],
		references: [workshops.id]
	}),
	jobCards: many(jobCards),
	invoices: many(invoices),
}));

export const workshopsRelations = relations(workshops, ({ many }) => ({
	customers: many(customers),
	jobCards: many(jobCards),
	inventoryItems: many(inventoryItems),
	suppliers: many(suppliers),
	purchases: many(purchases),
	invoices: many(invoices),
	workshopBreaks: many(workshopBreaks),
	users: many(users),
	expenses: many(expenses),
	bays: many(bays),
	services: many(services),
}));

export const jobCardsRelations = relations(jobCards, ({ one, many }) => ({
	customer: one(customers, {
		fields: [jobCards.customerId],
		references: [customers.id]
	}),
	vehicle: one(vehicles, {
		fields: [jobCards.vehicleId],
		references: [vehicles.id]
	}),
	workshop: one(workshops, {
		fields: [jobCards.workshopId],
		references: [workshops.id]
	}),
	jobComplaints: many(jobComplaints),
	jobParts: many(jobParts),
	jobInspections: many(jobInspections),
	jobItems: many(jobItems),
	invoices: many(invoices),
}));

export const jobComplaintsRelations = relations(jobComplaints, ({ one }) => ({
	jobCard: one(jobCards, {
		fields: [jobComplaints.jobCardId],
		references: [jobCards.id]
	}),
}));

export const jobPartsRelations = relations(jobParts, ({ one }) => ({
	inventoryBatch: one(inventoryBatches, {
		fields: [jobParts.batchId],
		references: [inventoryBatches.id]
	}),
	inventoryItem: one(inventoryItems, {
		fields: [jobParts.itemId],
		references: [inventoryItems.id]
	}),
	jobCard: one(jobCards, {
		fields: [jobParts.jobCardId],
		references: [jobCards.id]
	}),
}));

export const inventoryBatchesRelations = relations(inventoryBatches, ({ one, many }) => ({
	jobParts: many(jobParts),
	inventoryItem: one(inventoryItems, {
		fields: [inventoryBatches.itemId],
		references: [inventoryItems.id]
	}),
}));



export const inventoryItemsRelations = relations(inventoryItems, ({ one, many }) => ({
	jobParts: many(jobParts),
	workshop: one(workshops, {
		fields: [inventoryItems.workshopId],
		references: [workshops.id]
	}),
	category: one(categories, {
		fields: [inventoryItems.categoryId],
		references: [categories.id]
	}),
	subCategory: one(subCategories, {
		fields: [inventoryItems.subCategoryId],
		references: [subCategories.id]
	}),
	inventoryVehicleMappings: many(inventoryVehicleMapping),
	inventoryPartNumbers: many(inventoryPartNumbers),
	inventoryBatches: many(inventoryBatches),
}));

export const jobInspectionsRelations = relations(jobInspections, ({ one }) => ({
	jobCard: one(jobCards, {
		fields: [jobInspections.jobCardId],
		references: [jobCards.id]
	}),
}));

export const jobItemsRelations = relations(jobItems, ({ one }) => ({
	jobCard: one(jobCards, {
		fields: [jobItems.jobCardId],
		references: [jobCards.id]
	}),
}));

export const subCategoriesRelations = relations(subCategories, ({ one }) => ({
	category: one(categories, {
		fields: [subCategories.categoryId],
		references: [categories.id]
	}),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
	subCategories: many(subCategories),
}));

export const inventoryVehicleMappingRelations = relations(inventoryVehicleMapping, ({ one }) => ({
	inventoryItem: one(inventoryItems, {
		fields: [inventoryVehicleMapping.itemId],
		references: [inventoryItems.id]
	}),
	model: one(models, {
		fields: [inventoryVehicleMapping.modelId],
		references: [models.id]
	}),
}));

export const inventoryPartNumbersRelations = relations(inventoryPartNumbers, ({ one }) => ({
	inventoryItem: one(inventoryItems, {
		fields: [inventoryPartNumbers.itemId],
		references: [inventoryItems.id]
	}),
}));

export const suppliersRelations = relations(suppliers, ({ one, many }) => ({
	workshop: one(workshops, {
		fields: [suppliers.workshopId],
		references: [workshops.id]
	}),
	purchases: many(purchases),
}));

export const purchasesRelations = relations(purchases, ({ one, many }) => ({
	supplier: one(suppliers, {
		fields: [purchases.supplierId],
		references: [suppliers.id]
	}),
	workshop: one(workshops, {
		fields: [purchases.workshopId],
		references: [workshops.id]
	}),
	purchaseItems: many(purchaseItems),
}));

export const purchaseItemsRelations = relations(purchaseItems, ({ one }) => ({
	purchase: one(purchases, {
		fields: [purchaseItems.orderId],
		references: [purchases.id]
	}),
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
	customer: one(customers, {
		fields: [invoices.customerId],
		references: [customers.id]
	}),
	jobCard: one(jobCards, {
		fields: [invoices.jobCardId],
		references: [jobCards.id]
	}),
	workshop: one(workshops, {
		fields: [invoices.workshopId],
		references: [workshops.id]
	}),
	payments: many(payments),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
	invoice: one(invoices, {
		fields: [payments.invoiceId],
		references: [invoices.id]
	}),
}));

export const workshopBreaksRelations = relations(workshopBreaks, ({ one }) => ({
	workshop: one(workshops, {
		fields: [workshopBreaks.workshopId],
		references: [workshops.id]
	}),
}));

export const expensesRelations = relations(expenses, ({ one }) => ({
	workshop: one(workshops, {
		fields: [expenses.workshopId],
		references: [workshops.id]
	}),
}));

export const baysRelations = relations(bays, ({ one, many }) => ({
	workshop: one(workshops, {
		fields: [bays.workshopId],
		references: [workshops.id]
	}),
	serviceBayMappings: many(serviceBayMapping),
	slotBookings: many(slotBookings),
}));

export const servicesRelations = relations(services, ({ one, many }) => ({
	workshop: one(workshops, {
		fields: [services.workshopId],
		references: [workshops.id]
	}),
	serviceBayMappings: many(serviceBayMapping),
}));

export const serviceBayMappingRelations = relations(serviceBayMapping, ({ one }) => ({
	bay: one(bays, {
		fields: [serviceBayMapping.bayId],
		references: [bays.id]
	}),
	service: one(services, {
		fields: [serviceBayMapping.serviceId],
		references: [services.id]
	}),
}));

export const slotBookingsRelations = relations(slotBookings, ({ one }) => ({
	bay: one(bays, {
		fields: [slotBookings.bayId],
		references: [bays.id]
	}),
}));

// Map Settings for Bhuvan API
export const mapSettings = pgTable("map_settings", {
	id: text().primaryKey().notNull(),
	provider: text().notNull().default('bhuvan'), // 'bhuvan' | 'google'
	apiToken: text('api_token').notNull(),
	isActive: boolean('is_active').default(true).notNull(),
	expiresAt: timestamp('expires_at', { mode: 'string' }),
	createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull(),
});

// =============================================
// RSA (Roadside Assistance) Freelance System
// =============================================

// RSA Enums
export const rsaVehicleType = pgEnum("RsaVehicleType", ['BIKE', 'TOW_TRUCK', 'FLATBED', 'JUMPSTART_VAN', 'SERVICE_VAN']);
export const rsaServiceType = pgEnum("RsaServiceType", ['JUMPSTART', 'PUNCTURE', 'TOWING', 'RECOVERY', 'FUEL_DELIVERY']);
export const rsaJobStatus = pgEnum("RsaJobStatus", ['REQUESTED', 'ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']);

// RSA Profiles - Freelancer identity (NOT tied to workshop)
export const rsaProfiles = pgTable("rsa_profiles", {
	id: text().primaryKey().notNull(),
	userId: text('user_id').notNull(),
	name: text().notNull(),
	phone: text().notNull(),
	vehicleType: rsaVehicleType('vehicle_type').notNull(),
	services: text('services').array().notNull(), // Array of RsaServiceType values
	isActive: boolean('is_active').default(true).notNull(),
	isOnline: boolean('is_online').default(false).notNull(),
	currentLat: doublePrecision('current_lat'),
	currentLng: doublePrecision('current_lng'),
	rating: doublePrecision().default(5.0),
	totalJobs: integer('total_jobs').default(0),
	createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	uniqueIndex("rsa_profiles_userId_key").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
		columns: [table.userId],
		foreignColumns: [users.id],
		name: "rsa_profiles_userId_fkey"
	}).onUpdate("cascade").onDelete("restrict"),
]);

// RSA Jobs - Service requests from clients
export const rsaJobs = pgTable("rsa_jobs", {
	id: text().primaryKey().notNull(),
	clientId: text('client_id').notNull(),
	rsaId: text('rsa_id'), // Nullable until RSA accepts
	vehicleId: text('vehicle_id').notNull(),

	serviceType: rsaServiceType('service_type').notNull(),
	status: rsaJobStatus().default('REQUESTED').notNull(),

	pickupLat: doublePrecision('pickup_lat').notNull(),
	pickupLng: doublePrecision('pickup_lng').notNull(),
	pickupAddress: text('pickup_address'),

	destinationLat: doublePrecision('destination_lat'),
	destinationLng: doublePrecision('destination_lng'),
	destinationAddress: text('destination_address'),
	destinationWorkshopId: text('destination_workshop_id'),

	fare: doublePrecision(),
	distanceKm: doublePrecision('distance_km'),

	notes: text(),
	cancellationReason: text('cancellation_reason'),

	// OTP Verification for RSA jobs
	startOtp: text('start_otp'), // 4-digit OTP to start work
	endOtp: text('end_otp'), // 4-digit OTP for completion (Recovery)
	startOtpVerifiedAt: timestamp('start_otp_verified_at', { mode: 'string' }),
	endOtpVerifiedAt: timestamp('end_otp_verified_at', { mode: 'string' }),

	// Client feedback
	clientRating: integer('client_rating'), // 1-5 stars
	clientFeedback: text('client_feedback'),
	problemSolved: boolean('problem_solved'),

	// RSA Provider feedback
	rsaFeedback: text('rsa_feedback'),

	createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
	acceptedAt: timestamp('accepted_at', { mode: 'string' }),
	arrivedAt: timestamp('arrived_at', { mode: 'string' }),
	workStartedAt: timestamp('work_started_at', { mode: 'string' }),
	completedAt: timestamp('completed_at', { mode: 'string' }),
	cancelledAt: timestamp('cancelled_at', { mode: 'string' }),
}, (table) => [
	foreignKey({
		columns: [table.clientId],
		foreignColumns: [users.id],
		name: "rsa_jobs_clientId_fkey"
	}).onUpdate("cascade").onDelete("restrict"),
	foreignKey({
		columns: [table.rsaId],
		foreignColumns: [rsaProfiles.id],
		name: "rsa_jobs_rsaId_fkey"
	}).onUpdate("cascade").onDelete("set null"),
	foreignKey({
		columns: [table.vehicleId],
		foreignColumns: [vehicles.id],
		name: "rsa_jobs_vehicleId_fkey"
	}).onUpdate("cascade").onDelete("restrict"),
	foreignKey({
		columns: [table.destinationWorkshopId],
		foreignColumns: [workshops.id],
		name: "rsa_jobs_destinationWorkshopId_fkey"
	}).onUpdate("cascade").onDelete("set null"),
]);

// Vehicle Service History - Unified history for all services
export const vehicleServiceHistory = pgTable("vehicle_service_history", {
	id: text().primaryKey().notNull(),
	vehicleId: text('vehicle_id').notNull(),
	serviceType: text('service_type').notNull(), // RSA_JUMPSTART, RSA_TOWING, WORKSHOP_SERVICE, etc.
	performedBy: text('performed_by').notNull(), // 'RSA' | 'WORKSHOP'
	rsaJobId: text('rsa_job_id'),
	jobCardId: text('job_card_id'),
	workshopId: text('workshop_id'),
	rsaProfileId: text('rsa_profile_id'),
	notes: text(),
	serviceDate: timestamp('service_date', { mode: 'string' }).notNull(),
	createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
		columns: [table.vehicleId],
		foreignColumns: [vehicles.id],
		name: "vehicle_service_history_vehicleId_fkey"
	}).onUpdate("cascade").onDelete("restrict"),
	foreignKey({
		columns: [table.rsaJobId],
		foreignColumns: [rsaJobs.id],
		name: "vehicle_service_history_rsaJobId_fkey"
	}).onUpdate("cascade").onDelete("set null"),
	foreignKey({
		columns: [table.jobCardId],
		foreignColumns: [jobCards.id],
		name: "vehicle_service_history_jobCardId_fkey"
	}).onUpdate("cascade").onDelete("set null"),
	foreignKey({
		columns: [table.workshopId],
		foreignColumns: [workshops.id],
		name: "vehicle_service_history_workshopId_fkey"
	}).onUpdate("cascade").onDelete("set null"),
	foreignKey({
		columns: [table.rsaProfileId],
		foreignColumns: [rsaProfiles.id],
		name: "vehicle_service_history_rsaProfileId_fkey"
	}).onUpdate("cascade").onDelete("set null"),
]);

// RSA Relations
export const rsaProfilesRelations = relations(rsaProfiles, ({ one, many }) => ({
	user: one(users, {
		fields: [rsaProfiles.userId],
		references: [users.id]
	}),
	jobs: many(rsaJobs),
	serviceHistory: many(vehicleServiceHistory),
}));

export const rsaJobsRelations = relations(rsaJobs, ({ one }) => ({
	client: one(users, {
		fields: [rsaJobs.clientId],
		references: [users.id]
	}),
	rsa: one(rsaProfiles, {
		fields: [rsaJobs.rsaId],
		references: [rsaProfiles.id]
	}),
	vehicle: one(vehicles, {
		fields: [rsaJobs.vehicleId],
		references: [vehicles.id]
	}),
	destinationWorkshop: one(workshops, {
		fields: [rsaJobs.destinationWorkshopId],
		references: [workshops.id]
	}),
}));

export const vehicleServiceHistoryRelations = relations(vehicleServiceHistory, ({ one }) => ({
	vehicle: one(vehicles, {
		fields: [vehicleServiceHistory.vehicleId],
		references: [vehicles.id]
	}),
	rsaJob: one(rsaJobs, {
		fields: [vehicleServiceHistory.rsaJobId],
		references: [rsaJobs.id]
	}),
	jobCard: one(jobCards, {
		fields: [vehicleServiceHistory.jobCardId],
		references: [jobCards.id]
	}),
	workshop: one(workshops, {
		fields: [vehicleServiceHistory.workshopId],
		references: [workshops.id]
	}),
	rsaProfile: one(rsaProfiles, {
		fields: [vehicleServiceHistory.rsaProfileId],
		references: [rsaProfiles.id]
	}),
}));

// =============================================
// Client App Tables
// =============================================

// Client-Vehicle Linking (allows client to add vehicles to their dashboard)
export const clientVehicles = pgTable("client_vehicles", {
	id: text().primaryKey().notNull(),
	clientId: text('client_id').notNull(),
	vehicleId: text('vehicle_id').notNull(),
	addedAt: timestamp('added_at', { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	uniqueIndex("client_vehicles_clientId_vehicleId_key").using("btree", table.clientId.asc().nullsLast().op("text_ops"), table.vehicleId.asc().nullsLast().op("text_ops")),
	foreignKey({
		columns: [table.clientId],
		foreignColumns: [users.id],
		name: "client_vehicles_clientId_fkey"
	}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
		columns: [table.vehicleId],
		foreignColumns: [vehicles.id],
		name: "client_vehicles_vehicleId_fkey"
	}).onUpdate("cascade").onDelete("cascade"),
]);

// Workshop Service Bookings
export const workshopBookings = pgTable("workshop_bookings", {
	id: text().primaryKey().notNull(),
	clientId: text('client_id').notNull(),
	workshopId: text('workshop_id').notNull(),
	vehicleId: text('vehicle_id').notNull(),
	serviceCategories: text('service_categories').array(), // Array of selected service types
	bookingDate: timestamp('booking_date', { mode: 'string' }).notNull(),
	slotTime: text('slot_time').notNull(), // e.g., "09:00-10:00"
	status: bookingStatus().default('PENDING').notNull(),
	notes: text(),
	createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
		columns: [table.clientId],
		foreignColumns: [users.id],
		name: "workshop_bookings_clientId_fkey"
	}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
		columns: [table.workshopId],
		foreignColumns: [workshops.id],
		name: "workshop_bookings_workshopId_fkey"
	}).onUpdate("cascade").onDelete("restrict"),
	foreignKey({
		columns: [table.vehicleId],
		foreignColumns: [vehicles.id],
		name: "workshop_bookings_vehicleId_fkey"
	}).onUpdate("cascade").onDelete("restrict"),
]);

// Client Vehicles Relations
export const clientVehiclesRelations = relations(clientVehicles, ({ one }) => ({
	client: one(users, {
		fields: [clientVehicles.clientId],
		references: [users.id]
	}),
	vehicle: one(vehicles, {
		fields: [clientVehicles.vehicleId],
		references: [vehicles.id]
	}),
}));

// Workshop Bookings Relations
export const workshopBookingsRelations = relations(workshopBookings, ({ one }) => ({
	client: one(users, {
		fields: [workshopBookings.clientId],
		references: [users.id]
	}),
	workshop: one(workshops, {
		fields: [workshopBookings.workshopId],
		references: [workshops.id]
	}),
	vehicle: one(vehicles, {
		fields: [workshopBookings.vehicleId],
		references: [vehicles.id]
	}),
}));

// =============================================
// Enhanced Booking System Tables
// =============================================

// Workshop Bays - Service bays for slot management
export const workshopBays = pgTable("workshop_bays", {
	id: text().primaryKey().notNull(),
	workshopId: text('workshop_id').notNull(),
	name: text().notNull(), // "Bay 1", "Wash Bay A", etc.
	serviceCategories: text('service_categories').array(), // What services this bay handles
	isActive: boolean().default(true).notNull(),
	createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
		columns: [table.workshopId],
		foreignColumns: [workshops.id],
		name: "workshop_bays_workshopId_fkey"
	}).onUpdate("cascade").onDelete("cascade"),
]);

// Workshop Bay Slots - Like movie seats (available/booked/blocked)
export const workshopBaySlots = pgTable("workshop_bay_slots", {
	id: text().primaryKey().notNull(),
	bayId: text('bay_id').notNull(),
	date: text().notNull(), // "2026-01-06"
	startTime: text('start_time').notNull(), // "09:00"
	endTime: text('end_time').notNull(), // "10:00"
	bookingId: text('booking_id'), // null = available
	status: slotStatus().default('AVAILABLE').notNull(),
	createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
		columns: [table.bayId],
		foreignColumns: [workshopBays.id],
		name: "workshop_bay_slots_bayId_fkey"
	}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
		columns: [table.bookingId],
		foreignColumns: [workshopBookings.id],
		name: "workshop_bay_slots_bookingId_fkey"
	}).onUpdate("cascade").onDelete("set null"),
]);

// Workshop Ratings - Client reviews
export const workshopRatings = pgTable("workshop_ratings", {
	id: text().primaryKey().notNull(),
	workshopId: text('workshop_id').notNull(),
	clientId: text('client_id').notNull(),
	bookingId: text('booking_id').notNull(),
	rating: integer().notNull(), // 1-5 stars
	feedback: text(),
	createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
		columns: [table.workshopId],
		foreignColumns: [workshops.id],
		name: "workshop_ratings_workshopId_fkey"
	}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
		columns: [table.clientId],
		foreignColumns: [users.id],
		name: "workshop_ratings_clientId_fkey"
	}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
		columns: [table.bookingId],
		foreignColumns: [workshopBookings.id],
		name: "workshop_ratings_bookingId_fkey"
	}).onUpdate("cascade").onDelete("cascade"),
]);

// Workshop Bays Relations
export const workshopBaysRelations = relations(workshopBays, ({ one, many }) => ({
	workshop: one(workshops, {
		fields: [workshopBays.workshopId],
		references: [workshops.id]
	}),
	slots: many(workshopBaySlots),
}));

// Workshop Bay Slots Relations
export const workshopBaySlotsRelations = relations(workshopBaySlots, ({ one }) => ({
	bay: one(workshopBays, {
		fields: [workshopBaySlots.bayId],
		references: [workshopBays.id]
	}),
	booking: one(workshopBookings, {
		fields: [workshopBaySlots.bookingId],
		references: [workshopBookings.id]
	}),
}));

// Workshop Ratings Relations
export const workshopRatingsRelations = relations(workshopRatings, ({ one }) => ({
	workshop: one(workshops, {
		fields: [workshopRatings.workshopId],
		references: [workshops.id]
	}),
	client: one(users, {
		fields: [workshopRatings.clientId],
		references: [users.id]
	}),
	booking: one(workshopBookings, {
		fields: [workshopRatings.bookingId],
		references: [workshopBookings.id]
	}),
}));
