import { pgTable, uniqueIndex, text, foreignKey, integer, timestamp, boolean, doublePrecision, jsonb, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

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
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
}, (table) => [
	uniqueIndex("vehicles_regNumber_key").using("btree", table.regNumber.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.variantId],
			foreignColumns: [variants.id],
			name: "vehicles_variantId_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
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
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.workshopId],
			foreignColumns: [workshops.id],
			name: "inventory_items_workshopId_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
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
}, (table) => [
	foreignKey({
			columns: [table.workshopId],
			foreignColumns: [workshops.id],
			name: "suppliers_workshopId_fkey"
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
