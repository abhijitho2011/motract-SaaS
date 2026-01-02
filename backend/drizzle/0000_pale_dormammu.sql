-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TYPE "public"."ApprovalStatus" AS ENUM('PENDING', 'APPROVED', 'REJECTED');--> statement-breakpoint
CREATE TYPE "public"."BayType" AS ENUM('SERVICE', 'WASHING', 'ALIGNMENT', 'ELECTRICAL', 'GENERAL');--> statement-breakpoint
CREATE TYPE "public"."FuelType" AS ENUM('PETROL', 'DIESEL', 'CNG', 'ELECTRIC', 'HYBRID');--> statement-breakpoint
CREATE TYPE "public"."InvoiceType" AS ENUM('JOB_CARD', 'COUNTER_SALE');--> statement-breakpoint
CREATE TYPE "public"."JobPriority" AS ENUM('NORMAL', 'URGENT');--> statement-breakpoint
CREATE TYPE "public"."JobStage" AS ENUM('CREATED', 'INSPECTION', 'ESTIMATE', 'CUSTOMER_APPROVAL', 'WORK_IN_PROGRESS', 'QC', 'BILLING', 'DELIVERY', 'CLOSED');--> statement-breakpoint
CREATE TYPE "public"."PaymentMode" AS ENUM('CASH', 'UPI', 'CARD', 'BANK_TRANSFER', 'CREDIT');--> statement-breakpoint
CREATE TYPE "public"."Role" AS ENUM('SUPER_ADMIN', 'WORKSHOP_ADMIN', 'WORKSHOP_MANAGER', 'TECHNICIAN', 'CLIENT', 'RSA_PROVIDER', 'SUPPLIER');--> statement-breakpoint
CREATE TYPE "public"."SlotStatus" AS ENUM('AVAILABLE', 'BOOKED', 'BLOCKED');--> statement-breakpoint
CREATE TYPE "public"."TxnType" AS ENUM('CREDIT', 'DEBIT');--> statement-breakpoint
CREATE TABLE "makes" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "models" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"makeId" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "variants" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"fuelType" "FuelType" NOT NULL,
	"modelId" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vehicles" (
	"id" text PRIMARY KEY NOT NULL,
	"regNumber" text NOT NULL,
	"chassisNumber" text,
	"engineNumber" text,
	"vin" text,
	"mfgYear" integer,
	"variantId" text NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vehicle_owners" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"vehicleId" text NOT NULL,
	"isPrimary" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" text PRIMARY KEY NOT NULL,
	"workshopId" text NOT NULL,
	"name" text NOT NULL,
	"mobile" text NOT NULL,
	"email" text,
	"address" text,
	"gstin" text,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_cards" (
	"id" text PRIMARY KEY NOT NULL,
	"workshopId" text NOT NULL,
	"vehicleId" text NOT NULL,
	"customerId" text NOT NULL,
	"stage" "JobStage" DEFAULT 'CREATED' NOT NULL,
	"priority" "JobPriority" DEFAULT 'NORMAL' NOT NULL,
	"odometer" integer,
	"fuelLevel" integer,
	"entryTime" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"estimatedDeliveryTime" timestamp(3),
	"actualDeliveryTime" timestamp(3),
	"advisorId" text,
	"technicianId" text,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_complaints" (
	"id" text PRIMARY KEY NOT NULL,
	"jobCardId" text NOT NULL,
	"complaint" text NOT NULL,
	"remark" text
);
--> statement-breakpoint
CREATE TABLE "workshops" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"address" text,
	"city" text,
	"state" text,
	"pincode" text,
	"gstin" text,
	"mobile" text NOT NULL,
	"email" text,
	"logoUrl" text,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL,
	"latitude" double precision,
	"longitude" double precision,
	"workingStartHour" text DEFAULT '09:00' NOT NULL,
	"workingEndHour" text DEFAULT '19:00' NOT NULL,
	"slotDurationMin" integer DEFAULT 30 NOT NULL,
	"workingDays" text[] DEFAULT '{"RAY['MON'::text","'TUE'::text","'WED'::text","'THU'::text","'FRI'::text","'SAT'::tex"}'
);
--> statement-breakpoint
CREATE TABLE "job_parts" (
	"id" text PRIMARY KEY NOT NULL,
	"jobCardId" text NOT NULL,
	"itemId" text NOT NULL,
	"batchId" text,
	"quantity" double precision NOT NULL,
	"unitPrice" double precision NOT NULL,
	"gstPercent" double precision NOT NULL,
	"totalPrice" double precision NOT NULL,
	"isApproved" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_inspections" (
	"id" text PRIMARY KEY NOT NULL,
	"jobCardId" text NOT NULL,
	"exterior" jsonb,
	"interior" jsonb,
	"tyres" jsonb,
	"battery" text,
	"documents" jsonb,
	"photos" text[]
);
--> statement-breakpoint
CREATE TABLE "job_items" (
	"id" text PRIMARY KEY NOT NULL,
	"jobCardId" text NOT NULL,
	"description" text NOT NULL,
	"price" double precision NOT NULL,
	"gstPercent" double precision DEFAULT 18 NOT NULL,
	"isApproved" boolean DEFAULT false NOT NULL,
	"completionStatus" text
);
--> statement-breakpoint
CREATE TABLE "sub_categories" (
	"id" text PRIMARY KEY NOT NULL,
	"categoryId" text NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventory_items" (
	"id" text PRIMARY KEY NOT NULL,
	"workshopId" text NOT NULL,
	"name" text NOT NULL,
	"brand" text,
	"isOem" boolean DEFAULT false NOT NULL,
	"hsnCode" text,
	"taxPercent" double precision DEFAULT 18 NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventory_vehicle_mapping" (
	"id" text PRIMARY KEY NOT NULL,
	"itemId" text NOT NULL,
	"modelId" text NOT NULL,
	"variantId" text
);
--> statement-breakpoint
CREATE TABLE "inventory_part_numbers" (
	"id" text PRIMARY KEY NOT NULL,
	"itemId" text NOT NULL,
	"skuCode" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "suppliers" (
	"id" text PRIMARY KEY NOT NULL,
	"workshopId" text NOT NULL,
	"name" text NOT NULL,
	"mobile" text NOT NULL,
	"gstin" text,
	"address" text
);
--> statement-breakpoint
CREATE TABLE "purchases" (
	"id" text PRIMARY KEY NOT NULL,
	"workshopId" text NOT NULL,
	"supplierId" text NOT NULL,
	"invoiceDate" timestamp(3) NOT NULL,
	"invoiceNumber" text,
	"totalAmount" double precision NOT NULL,
	"status" text NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "purchase_items" (
	"id" text PRIMARY KEY NOT NULL,
	"orderId" text NOT NULL,
	"itemName" text NOT NULL,
	"partNumber" text,
	"quantity" double precision NOT NULL,
	"unitCost" double precision NOT NULL,
	"taxPercent" double precision NOT NULL,
	"total" double precision NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" text PRIMARY KEY NOT NULL,
	"workshopId" text NOT NULL,
	"customerId" text NOT NULL,
	"jobCardId" text,
	"invoiceNumber" text NOT NULL,
	"invoiceDate" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"type" "InvoiceType" NOT NULL,
	"totalLabor" double precision DEFAULT 0 NOT NULL,
	"totalParts" double precision DEFAULT 0 NOT NULL,
	"cgst" double precision DEFAULT 0 NOT NULL,
	"sgst" double precision DEFAULT 0 NOT NULL,
	"igst" double precision DEFAULT 0 NOT NULL,
	"discount" double precision DEFAULT 0 NOT NULL,
	"grandTotal" double precision NOT NULL,
	"paidAmount" double precision DEFAULT 0 NOT NULL,
	"balance" double precision DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" text PRIMARY KEY NOT NULL,
	"invoiceId" text NOT NULL,
	"amount" double precision NOT NULL,
	"mode" "PaymentMode" NOT NULL,
	"reference" text,
	"date" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventory_batches" (
	"id" text PRIMARY KEY NOT NULL,
	"itemId" text NOT NULL,
	"batchNumber" text,
	"expiryDate" timestamp(3),
	"quantity" double precision NOT NULL,
	"purchasePrice" double precision NOT NULL,
	"salePrice" double precision NOT NULL,
	"purchasedAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workshop_breaks" (
	"id" text PRIMARY KEY NOT NULL,
	"workshopId" text NOT NULL,
	"title" text NOT NULL,
	"startTime" text NOT NULL,
	"endTime" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text,
	"mobile" text NOT NULL,
	"password" text,
	"role" "Role" NOT NULL,
	"name" text,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL,
	"workshopId" text
);
--> statement-breakpoint
CREATE TABLE "expenses" (
	"id" text PRIMARY KEY NOT NULL,
	"workshopId" text NOT NULL,
	"category" text NOT NULL,
	"amount" double precision NOT NULL,
	"date" timestamp(3) NOT NULL,
	"notes" text,
	"attachmentUrl" text
);
--> statement-breakpoint
CREATE TABLE "bays" (
	"id" text PRIMARY KEY NOT NULL,
	"workshopId" text NOT NULL,
	"name" text NOT NULL,
	"type" "BayType" NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" text PRIMARY KEY NOT NULL,
	"workshopId" text NOT NULL,
	"name" text NOT NULL,
	"durationMin" integer DEFAULT 30 NOT NULL,
	"price" double precision
);
--> statement-breakpoint
CREATE TABLE "service_bay_mapping" (
	"id" text PRIMARY KEY NOT NULL,
	"serviceId" text NOT NULL,
	"bayId" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "slot_bookings" (
	"id" text PRIMARY KEY NOT NULL,
	"bayId" text NOT NULL,
	"date" timestamp(3) NOT NULL,
	"startTime" text NOT NULL,
	"endTime" text NOT NULL,
	"status" "SlotStatus" NOT NULL,
	"jobCardId" text,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
ALTER TABLE "models" ADD CONSTRAINT "models_makeId_fkey" FOREIGN KEY ("makeId") REFERENCES "public"."makes"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "variants" ADD CONSTRAINT "variants_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "public"."models"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "public"."variants"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "vehicle_owners" ADD CONSTRAINT "vehicle_owners_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "vehicle_owners" ADD CONSTRAINT "vehicle_owners_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "public"."vehicles"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_workshopId_fkey" FOREIGN KEY ("workshopId") REFERENCES "public"."workshops"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "job_cards" ADD CONSTRAINT "job_cards_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."customers"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "job_cards" ADD CONSTRAINT "job_cards_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "public"."vehicles"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "job_cards" ADD CONSTRAINT "job_cards_workshopId_fkey" FOREIGN KEY ("workshopId") REFERENCES "public"."workshops"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "job_complaints" ADD CONSTRAINT "job_complaints_jobCardId_fkey" FOREIGN KEY ("jobCardId") REFERENCES "public"."job_cards"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "job_parts" ADD CONSTRAINT "job_parts_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "public"."inventory_batches"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "job_parts" ADD CONSTRAINT "job_parts_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "public"."inventory_items"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "job_parts" ADD CONSTRAINT "job_parts_jobCardId_fkey" FOREIGN KEY ("jobCardId") REFERENCES "public"."job_cards"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "job_inspections" ADD CONSTRAINT "job_inspections_jobCardId_fkey" FOREIGN KEY ("jobCardId") REFERENCES "public"."job_cards"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "job_items" ADD CONSTRAINT "job_items_jobCardId_fkey" FOREIGN KEY ("jobCardId") REFERENCES "public"."job_cards"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "sub_categories" ADD CONSTRAINT "sub_categories_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."categories"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_workshopId_fkey" FOREIGN KEY ("workshopId") REFERENCES "public"."workshops"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "inventory_vehicle_mapping" ADD CONSTRAINT "inventory_vehicle_mapping_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "public"."inventory_items"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "inventory_vehicle_mapping" ADD CONSTRAINT "inventory_vehicle_mapping_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "public"."models"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "inventory_part_numbers" ADD CONSTRAINT "inventory_part_numbers_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "public"."inventory_items"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_workshopId_fkey" FOREIGN KEY ("workshopId") REFERENCES "public"."workshops"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "public"."suppliers"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_workshopId_fkey" FOREIGN KEY ("workshopId") REFERENCES "public"."workshops"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "purchase_items" ADD CONSTRAINT "purchase_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."purchases"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."customers"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_jobCardId_fkey" FOREIGN KEY ("jobCardId") REFERENCES "public"."job_cards"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_workshopId_fkey" FOREIGN KEY ("workshopId") REFERENCES "public"."workshops"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "public"."invoices"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "inventory_batches" ADD CONSTRAINT "inventory_batches_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "public"."inventory_items"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "workshop_breaks" ADD CONSTRAINT "workshop_breaks_workshopId_fkey" FOREIGN KEY ("workshopId") REFERENCES "public"."workshops"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_workshopId_fkey" FOREIGN KEY ("workshopId") REFERENCES "public"."workshops"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_workshopId_fkey" FOREIGN KEY ("workshopId") REFERENCES "public"."workshops"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "bays" ADD CONSTRAINT "bays_workshopId_fkey" FOREIGN KEY ("workshopId") REFERENCES "public"."workshops"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_workshopId_fkey" FOREIGN KEY ("workshopId") REFERENCES "public"."workshops"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "service_bay_mapping" ADD CONSTRAINT "service_bay_mapping_bayId_fkey" FOREIGN KEY ("bayId") REFERENCES "public"."bays"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "service_bay_mapping" ADD CONSTRAINT "service_bay_mapping_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "public"."services"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "slot_bookings" ADD CONSTRAINT "slot_bookings_bayId_fkey" FOREIGN KEY ("bayId") REFERENCES "public"."bays"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
CREATE UNIQUE INDEX "makes_name_key" ON "makes" USING btree ("name" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "models_makeId_name_key" ON "models" USING btree ("makeId" text_ops,"name" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "variants_modelId_name_fuelType_key" ON "variants" USING btree ("modelId" enum_ops,"name" text_ops,"fuelType" enum_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "vehicles_regNumber_key" ON "vehicles" USING btree ("regNumber" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "vehicle_owners_userId_vehicleId_key" ON "vehicle_owners" USING btree ("userId" text_ops,"vehicleId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "customers_workshopId_mobile_key" ON "customers" USING btree ("workshopId" text_ops,"mobile" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "job_inspections_jobCardId_key" ON "job_inspections" USING btree ("jobCardId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "inventory_part_numbers_itemId_skuCode_key" ON "inventory_part_numbers" USING btree ("itemId" text_ops,"skuCode" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "invoices_jobCardId_key" ON "invoices" USING btree ("jobCardId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_key" ON "users" USING btree ("email" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "users_mobile_key" ON "users" USING btree ("mobile" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "service_bay_mapping_serviceId_bayId_key" ON "service_bay_mapping" USING btree ("serviceId" text_ops,"bayId" text_ops);
*/