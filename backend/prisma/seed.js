"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var categories, _i, categories_1, cat, vehicles, _a, vehicles_1, v, make, _b, _c, m, model, _d, _e, variantName;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    console.log('Seeding Master Data...');
                    categories = ['Spare Parts', 'Lubricants & Fluids', 'Tyres', 'Batteries', 'Accessories'];
                    _i = 0, categories_1 = categories;
                    _f.label = 1;
                case 1:
                    if (!(_i < categories_1.length)) return [3 /*break*/, 4];
                    cat = categories_1[_i];
                    return [4 /*yield*/, prisma.category.create({ data: { name: cat } })];
                case 2:
                    _f.sent();
                    _f.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4:
                    vehicles = [
                        {
                            make: 'Maruti Suzuki',
                            models: [
                                { name: 'Swift', variants: ['LXi', 'VXi', 'ZXi'] },
                                { name: 'Baleno', variants: ['Sigma', 'Delta', 'Zeta', 'Alpha'] },
                            ],
                        },
                        {
                            make: 'Hyundai',
                            models: [
                                { name: 'i20', variants: ['Magna', 'Sportz', 'Asta'] },
                                { name: 'Creta', variants: ['E', 'EX', 'S', 'SX'] },
                            ],
                        },
                        {
                            make: 'Tata',
                            models: [
                                { name: 'Nexon', variants: ['XE', 'XM', 'XZ'] },
                                { name: 'Harrier', variants: ['XM', 'XZ', 'XZ+'] },
                            ],
                        },
                    ];
                    _a = 0, vehicles_1 = vehicles;
                    _f.label = 5;
                case 5:
                    if (!(_a < vehicles_1.length)) return [3 /*break*/, 14];
                    v = vehicles_1[_a];
                    return [4 /*yield*/, prisma.make.create({
                            data: { name: v.make },
                        })];
                case 6:
                    make = _f.sent();
                    _b = 0, _c = v.models;
                    _f.label = 7;
                case 7:
                    if (!(_b < _c.length)) return [3 /*break*/, 13];
                    m = _c[_b];
                    return [4 /*yield*/, prisma.model.create({
                            data: {
                                name: m.name,
                                makeId: make.id,
                            },
                        })];
                case 8:
                    model = _f.sent();
                    _d = 0, _e = m.variants;
                    _f.label = 9;
                case 9:
                    if (!(_d < _e.length)) return [3 /*break*/, 12];
                    variantName = _e[_d];
                    // Create Petrol variant for simplicity in Phase 1 seed
                    return [4 /*yield*/, prisma.variant.create({
                            data: {
                                name: variantName,
                                fuelType: client_1.FuelType.PETROL,
                                modelId: model.id,
                            },
                        })];
                case 10:
                    // Create Petrol variant for simplicity in Phase 1 seed
                    _f.sent();
                    _f.label = 11;
                case 11:
                    _d++;
                    return [3 /*break*/, 9];
                case 12:
                    _b++;
                    return [3 /*break*/, 7];
                case 13:
                    _a++;
                    return [3 /*break*/, 5];
                case 14:
                    console.log('Seeding completed.');
                    return [2 /*return*/];
            }
        });
    });
}
main()
    .catch(function (e) {
    console.error(e);
    process.exit(1);
})
    .finally(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.$disconnect()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
