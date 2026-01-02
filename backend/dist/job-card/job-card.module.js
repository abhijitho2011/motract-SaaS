"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobCardModule = void 0;
const common_1 = require("@nestjs/common");
const job_card_service_1 = require("./job-card.service");
const job_card_controller_1 = require("./job-card.controller");
let JobCardModule = class JobCardModule {
};
exports.JobCardModule = JobCardModule;
exports.JobCardModule = JobCardModule = __decorate([
    (0, common_1.Module)({
        providers: [job_card_service_1.JobCardService],
        controllers: [job_card_controller_1.JobCardController],
    })
], JobCardModule);
//# sourceMappingURL=job-card.module.js.map