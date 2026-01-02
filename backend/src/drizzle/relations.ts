import { relations } from "drizzle-orm/relations";
import { makes, models, variants, vehicles, users, vehicleOwners, workshops, customers, jobCards, jobComplaints, inventoryBatches, jobParts, inventoryItems, jobInspections, jobItems, categories, subCategories, inventoryVehicleMapping, inventoryPartNumbers, suppliers, purchases, purchaseItems, invoices, payments, workshopBreaks, expenses, bays, services, serviceBayMapping, slotBookings } from "./schema";

export const modelsRelations = relations(models, ({one, many}) => ({
	make: one(makes, {
		fields: [models.makeId],
		references: [makes.id]
	}),
	variants: many(variants),
	inventoryVehicleMappings: many(inventoryVehicleMapping),
}));

export const makesRelations = relations(makes, ({many}) => ({
	models: many(models),
}));

export const variantsRelations = relations(variants, ({one, many}) => ({
	model: one(models, {
		fields: [variants.modelId],
		references: [models.id]
	}),
	vehicles: many(vehicles),
}));

export const vehiclesRelations = relations(vehicles, ({one, many}) => ({
	variant: one(variants, {
		fields: [vehicles.variantId],
		references: [variants.id]
	}),
	vehicleOwners: many(vehicleOwners),
	jobCards: many(jobCards),
}));

export const vehicleOwnersRelations = relations(vehicleOwners, ({one}) => ({
	user: one(users, {
		fields: [vehicleOwners.userId],
		references: [users.id]
	}),
	vehicle: one(vehicles, {
		fields: [vehicleOwners.vehicleId],
		references: [vehicles.id]
	}),
}));

export const usersRelations = relations(users, ({one, many}) => ({
	vehicleOwners: many(vehicleOwners),
	workshop: one(workshops, {
		fields: [users.workshopId],
		references: [workshops.id]
	}),
}));

export const customersRelations = relations(customers, ({one, many}) => ({
	workshop: one(workshops, {
		fields: [customers.workshopId],
		references: [workshops.id]
	}),
	jobCards: many(jobCards),
	invoices: many(invoices),
}));

export const workshopsRelations = relations(workshops, ({many}) => ({
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

export const jobCardsRelations = relations(jobCards, ({one, many}) => ({
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

export const jobComplaintsRelations = relations(jobComplaints, ({one}) => ({
	jobCard: one(jobCards, {
		fields: [jobComplaints.jobCardId],
		references: [jobCards.id]
	}),
}));

export const jobPartsRelations = relations(jobParts, ({one}) => ({
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

export const inventoryBatchesRelations = relations(inventoryBatches, ({one, many}) => ({
	jobParts: many(jobParts),
	inventoryItem: one(inventoryItems, {
		fields: [inventoryBatches.itemId],
		references: [inventoryItems.id]
	}),
}));

export const inventoryItemsRelations = relations(inventoryItems, ({one, many}) => ({
	jobParts: many(jobParts),
	workshop: one(workshops, {
		fields: [inventoryItems.workshopId],
		references: [workshops.id]
	}),
	inventoryVehicleMappings: many(inventoryVehicleMapping),
	inventoryPartNumbers: many(inventoryPartNumbers),
	inventoryBatches: many(inventoryBatches),
}));

export const jobInspectionsRelations = relations(jobInspections, ({one}) => ({
	jobCard: one(jobCards, {
		fields: [jobInspections.jobCardId],
		references: [jobCards.id]
	}),
}));

export const jobItemsRelations = relations(jobItems, ({one}) => ({
	jobCard: one(jobCards, {
		fields: [jobItems.jobCardId],
		references: [jobCards.id]
	}),
}));

export const subCategoriesRelations = relations(subCategories, ({one}) => ({
	category: one(categories, {
		fields: [subCategories.categoryId],
		references: [categories.id]
	}),
}));

export const categoriesRelations = relations(categories, ({many}) => ({
	subCategories: many(subCategories),
}));

export const inventoryVehicleMappingRelations = relations(inventoryVehicleMapping, ({one}) => ({
	inventoryItem: one(inventoryItems, {
		fields: [inventoryVehicleMapping.itemId],
		references: [inventoryItems.id]
	}),
	model: one(models, {
		fields: [inventoryVehicleMapping.modelId],
		references: [models.id]
	}),
}));

export const inventoryPartNumbersRelations = relations(inventoryPartNumbers, ({one}) => ({
	inventoryItem: one(inventoryItems, {
		fields: [inventoryPartNumbers.itemId],
		references: [inventoryItems.id]
	}),
}));

export const suppliersRelations = relations(suppliers, ({one, many}) => ({
	workshop: one(workshops, {
		fields: [suppliers.workshopId],
		references: [workshops.id]
	}),
	purchases: many(purchases),
}));

export const purchasesRelations = relations(purchases, ({one, many}) => ({
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

export const purchaseItemsRelations = relations(purchaseItems, ({one}) => ({
	purchase: one(purchases, {
		fields: [purchaseItems.orderId],
		references: [purchases.id]
	}),
}));

export const invoicesRelations = relations(invoices, ({one, many}) => ({
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

export const paymentsRelations = relations(payments, ({one}) => ({
	invoice: one(invoices, {
		fields: [payments.invoiceId],
		references: [invoices.id]
	}),
}));

export const workshopBreaksRelations = relations(workshopBreaks, ({one}) => ({
	workshop: one(workshops, {
		fields: [workshopBreaks.workshopId],
		references: [workshops.id]
	}),
}));

export const expensesRelations = relations(expenses, ({one}) => ({
	workshop: one(workshops, {
		fields: [expenses.workshopId],
		references: [workshops.id]
	}),
}));

export const baysRelations = relations(bays, ({one, many}) => ({
	workshop: one(workshops, {
		fields: [bays.workshopId],
		references: [workshops.id]
	}),
	serviceBayMappings: many(serviceBayMapping),
	slotBookings: many(slotBookings),
}));

export const servicesRelations = relations(services, ({one, many}) => ({
	workshop: one(workshops, {
		fields: [services.workshopId],
		references: [workshops.id]
	}),
	serviceBayMappings: many(serviceBayMapping),
}));

export const serviceBayMappingRelations = relations(serviceBayMapping, ({one}) => ({
	bay: one(bays, {
		fields: [serviceBayMapping.bayId],
		references: [bays.id]
	}),
	service: one(services, {
		fields: [serviceBayMapping.serviceId],
		references: [services.id]
	}),
}));

export const slotBookingsRelations = relations(slotBookings, ({one}) => ({
	bay: one(bays, {
		fields: [slotBookings.bayId],
		references: [bays.id]
	}),
}));