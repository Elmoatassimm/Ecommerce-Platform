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
var bcrypt = require("bcryptjs");
var prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var password_hash, user, store, categories, products, _a, _b, _c, customer, order, orderItems, _d, _e, _f, payment, metaIntegration, chargiliAccount;
        var _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
        return __generator(this, function (_s) {
            switch (_s.label) {
                case 0: return [4 /*yield*/, bcrypt.hash("password", 10)];
                case 1:
                    password_hash = _s.sent();
                    return [4 /*yield*/, prisma.user.create({
                            data: {
                                username: "store_ownnnner",
                                email: "owner@exampppppple.com",
                                password_hash: password_hash,
                            },
                        })];
                case 2:
                    user = _s.sent();
                    return [4 /*yield*/, prisma.store.create({
                            data: {
                                name: "My Awesome Store",
                                description: "Sample store for testing purposes",
                                owner_id: user.id,
                                meta_integration_status: true,
                                payment_setup_status: true,
                            },
                        })];
                case 3:
                    store = _s.sent();
                    return [4 /*yield*/, prisma.category.createMany({
                            data: [
                                {
                                    store_id: store.id,
                                    name: "Electronics",
                                },
                                {
                                    store_id: store.id,
                                    name: "Clothing",
                                },
                            ],
                        })];
                case 4:
                    categories = _s.sent();
                    _b = (_a = prisma.product).createMany;
                    _g = {};
                    _h = {
                        store_id: store.id,
                        name: "Smartphone",
                        description: "Latest model smartphone",
                        price: 599.99
                    };
                    return [4 /*yield*/, prisma.category.findFirst({
                            where: { name: "Electronics" },
                        })];
                case 5:
                    _c = [
                        (_h.category_id = (_s.sent()).id,
                            _h.inventory_count = 50,
                            _h.images = ["1738443877695-565753061.png", "1738443877695-565753061.png"],
                            _h)
                    ];
                    _j = {
                        store_id: store.id,
                        name: "T-Shirt",
                        description: "Cotton t-shirt",
                        price: 29.99
                    };
                    return [4 /*yield*/, prisma.category.findFirst({
                            where: { name: "Clothing" },
                        })];
                case 6:
                    _c = _c.concat([
                        (_j.category_id = (_s.sent()).id,
                            _j.inventory_count = 100,
                            _j.images = ["1738443877695-565753061.png"],
                            _j)
                    ]);
                    _k = {
                        store_id: store.id,
                        name: "T-Shirt",
                        description: "Cotton t-shirt",
                        price: 29.99
                    };
                    return [4 /*yield*/, prisma.category.findFirst({
                            where: { name: "Clothing" },
                        })];
                case 7:
                    _c = _c.concat([
                        (_k.category_id = (_s.sent()).id,
                            _k.inventory_count = 100,
                            _k.images = ["1738443877695-565753061.png"],
                            _k)
                    ]);
                    _l = {
                        store_id: store.id,
                        name: "T-Shirt",
                        description: "Cotton t-shirt",
                        price: 29.99
                    };
                    return [4 /*yield*/, prisma.category.findFirst({
                            where: { name: "Clothing" },
                        })];
                case 8:
                    _c = _c.concat([
                        (_l.category_id = (_s.sent()).id,
                            _l.inventory_count = 100,
                            _l.images = ["1738443877695-565753061.png"],
                            _l)
                    ]);
                    _m = {
                        store_id: store.id,
                        name: "T-Shirt",
                        description: "Cotton t-shirt",
                        price: 29.99
                    };
                    return [4 /*yield*/, prisma.category.findFirst({
                            where: { name: "Clothing" },
                        })];
                case 9:
                    _c = _c.concat([
                        (_m.category_id = (_s.sent()).id,
                            _m.inventory_count = 100,
                            _m.images = ["1738443877695-565753061.png"],
                            _m)
                    ]);
                    _o = {
                        store_id: store.id,
                        name: "T-Shirt",
                        description: "Cotton t-shirt",
                        price: 29.99
                    };
                    return [4 /*yield*/, prisma.category.findFirst({
                            where: { name: "Clothing" },
                        })];
                case 10: return [4 /*yield*/, _b.apply(_a, [(_g.data = _c.concat([
                            (_o.category_id = (_s.sent()).id,
                                _o.inventory_count = 100,
                                _o.images = ["1738443877695-565753061.png"],
                                _o)
                        ]),
                            _g)])];
                case 11:
                    products = _s.sent();
                    return [4 /*yield*/, prisma.customer.create({
                            data: {
                                name: "John Doe",
                                email: "john@example.com",
                                phone: "+1234567890",
                                store_id: store.id,
                            },
                        })];
                case 12:
                    customer = _s.sent();
                    return [4 /*yield*/, prisma.order.create({
                            data: {
                                store_id: store.id,
                                customer_id: customer.id,
                                total_amount: 629.98,
                                status: "pending",
                                payment_method: "cash_on_delivery",
                                order_source: "platform",
                                address: {
                                    street: "123 Main St",
                                    city: "Anytown",
                                    country: "Country",
                                },
                            },
                        })];
                case 13:
                    order = _s.sent();
                    _e = (_d = prisma.orderItem).createMany;
                    _p = {};
                    _q = {
                        order_id: order.id
                    };
                    return [4 /*yield*/, prisma.product.findFirst({
                            where: { name: "Smartphone" },
                        })];
                case 14:
                    _f = [
                        (_q.product_id = (_s.sent()).id,
                            _q.quantity = 1,
                            _q.unit_price = 599.99,
                            _q)
                    ];
                    _r = {
                        order_id: order.id
                    };
                    return [4 /*yield*/, prisma.product.findFirst({
                            where: { name: "T-Shirt" },
                        })];
                case 15: return [4 /*yield*/, _e.apply(_d, [(_p.data = _f.concat([
                            (_r.product_id = (_s.sent()).id,
                                _r.quantity = 1,
                                _r.unit_price = 29.99,
                                _r)
                        ]),
                            _p)])];
                case 16:
                    orderItems = _s.sent();
                    return [4 /*yield*/, prisma.payment.create({
                            data: {
                                transaction_id: "444444444444444",
                                order_id: order.id,
                                amount: 629.98,
                                payment_method: "cash_on_delivery",
                                status: "pending",
                                gateway_response: {},
                            },
                        })];
                case 17:
                    payment = _s.sent();
                    return [4 /*yield*/, prisma.metaIntegration.create({
                            data: {
                                store_id: store.id,
                                page_id: "123456789",
                                app_id: "987654321",
                                access_token: "meta_access_token_here",
                            },
                        })];
                case 18:
                    metaIntegration = _s.sent();
                    return [4 /*yield*/, prisma.chargiliAccount.create({
                            data: {
                                store_id: store.id,
                                SECRET_KEY: "chargili_secret_key_here",
                            },
                        })];
                case 19:
                    chargiliAccount = _s.sent();
                    console.log("Database seeded successfully!");
                    return [2 /*return*/];
            }
        });
    });
}
main()
    .catch(function (e) {
    console.log("tnakt");
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
