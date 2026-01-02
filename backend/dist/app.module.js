"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const drizzle_module_1 = require("./drizzle/drizzle.module");
const users_module_1 = require("./users/users.module");
const auth_module_1 = require("./auth/auth.module");
const vehicle_module_1 = require("./vehicle/vehicle.module");
const job_card_module_1 = require("./job-card/job-card.module");
const inventory_module_1 = require("./inventory/inventory.module");
const billing_module_1 = require("./billing/billing.module");
const slot_module_1 = require("./slot/slot.module");
const dashboard_module_1 = require("./dashboard/dashboard.module");
const purchase_module_1 = require("./purchase/purchase.module");
const expense_module_1 = require("./expense/expense.module");
const reports_module_1 = require("./reports/reports.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            drizzle_module_1.DrizzleModule,
            users_module_1.UsersModule,
            auth_module_1.AuthModule,
            vehicle_module_1.VehicleModule,
            job_card_module_1.JobCardModule,
            inventory_module_1.InventoryModule,
            billing_module_1.BillingModule,
            slot_module_1.SlotModule,
            dashboard_module_1.DashboardModule,
            purchase_module_1.PurchaseModule,
            expense_module_1.ExpenseModule,
            reports_module_1.ReportsModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map