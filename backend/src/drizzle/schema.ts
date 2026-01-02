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
