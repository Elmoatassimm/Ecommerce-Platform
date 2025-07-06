import "reflect-metadata"; // Required for tsyringe to work
import { container } from "tsyringe";
import IUserService from "../services/Interfaces/IUserService";
import { UserService } from "../services/user.service";
import IUserRepository from "../repositories/interfaces/IUserRepository";
import UserRepository from "../repositories/user.repository";
import ResponseUtils from "../utils/response.utils";
import JwtUtils from "../utils/jwt.utils";
import db from "./db";
import IRefreshTokenRepository from "../repositories/interfaces/IRefreshTokenInterface";
import RefreshTokenRepository from "../repositories/refreshToken.repository";
import IStoreService from "../services/Interfaces/IStoreService";
import StoreService from "../services/store.service";
import IStoreRepository from "../repositories/interfaces/IStoreRepository";
import StoreRepository from "../repositories/store.repository";
import IProductService from "../services/Interfaces/IProductService";
import ProductService from "../services/product.service";
import IProductRepository from "../repositories/interfaces/IProductRepository";
import ProductRepository from "../repositories/product.repository";
import ImageUtils from "../utils/images.utils";
import GlobalErrorHandler from "../middlewares/errors.middlware";
import ICategoryService from "../services/Interfaces/ICategoryService";
import CategoryService from "../services/category.service";
import ICategoryRepository from "../repositories/interfaces/ICategoryRepository";
import CategoryRepository from "../repositories/category.repository";
import ChargiliAccountRepository from "../repositories/chargiliAccount.repository";
import ChargiliAccountService from "../services/chargiliAccount.service";
import IChargiliAccountService from "../services/Interfaces/IChargiliAccountService";
import IChargiliAccountRepository from "../repositories/interfaces/IChargiliAccountRepository";
import IMetaRepository from "../repositories/interfaces/IMetaRepository";
import MetaRepository from "../repositories/meta.repository";
import IMetaService from "../services/Interfaces/IMetaService";
import MetaService from "../services/meta.service";
import ICustomerRepository from "../repositories/interfaces/ICustomerRepository";
import CustomerRepository from "../repositories/customer.repository";
import ICustomerService from "../services/Interfaces/ICustomerService";
import CustomerService from "../services/customer.service";
import IPaymentRepository from "../repositories/interfaces/IPaymentRepository";
import PaymentRepository from "../repositories/payment.repository";
import PaymentProcessorFactory from "../services/payment/payment.factory";
import CashOnDeliveryPay from "../services/payment/cashOnDelivery.service";
import ChargiliPay from "../services/payment/chargiliPay.service";
import { PaymentService } from "../services/payment/payment.service";
import CheckoutMediatorService from "../services/checkoutMediator.service";
import IOrderService from "../services/Interfaces/IOrderService";
import OrderService from "../services/order.service";
import IOrderRepository from "../repositories/interfaces/IOrederRepository";
import OrderRepository from "../repositories/order.repository";
import IPaymentService from "../services/Interfaces/IPaymentService";
import { RedisClient } from "./redis";
import ProductsCacheRepository from "../repositories/product.cache";


import WebSocketService from "../services/websocket.service";


//________________utils_______________________

container.register("imageUtils", {
  useClass: ImageUtils,
});

container.register("responseUtils", {
  useClass: ResponseUtils,
});

container.register("jwt", {
  useClass: JwtUtils,
});

container.register("db", { useClass: db });


container.register("errorsHandler", { useClass: GlobalErrorHandler });


container.register("RedisClient", {
  useClass: RedisClient,
});

container.register("ProductsCacheRepository",{
  useClass : ProductsCacheRepository,
})

//_____________user module _______________________
container.register<IUserRepository>("IUserRepository", {
  useClass: UserRepository,
});

container.register<IRefreshTokenRepository>("IRefreshTokenRepository", {
  useClass: RefreshTokenRepository,
});
container.register<IUserService>("IUserService", {
  useClass: UserService,
});

// _______________store module ____________________

container.register<IStoreRepository>("IStoreRepository", {
  useClass: StoreRepository,
});

container.register<IStoreService>("IStoreService", {
  useClass: StoreService,
});

//________________product module _____________________
container.register<IProductRepository>("IProductRepository", {
  useClass: ProductRepository,
});

container.register<IProductService>("IProductService", {
  useClass: ProductService,
});

//_________category module _____________

container.register<ICategoryRepository>("ICategoryRepository", {
  useClass: CategoryRepository,
});

container.register<ICategoryService>("ICategoryService", {
  useClass: CategoryService,
});

//_________Chargili Account module _____________
container.register<IChargiliAccountRepository>("IChargiliAccountRepository", {
  useClass: ChargiliAccountRepository,
});
container.register<IChargiliAccountService>("IChargiliAccountService", {
  useClass: ChargiliAccountService,
});

//___________Meta Integration module ___________
container.register<IMetaRepository>("IMetaRepository", {
  useClass: MetaRepository,
});

container.register<IMetaService>("IMetaService", {
  useClass: MetaService,
});
//____________ Customer module ______________
container.register<ICustomerRepository>("ICustomerRepository", {
  useClass: CustomerRepository,
});

container.register<ICustomerService>("ICustomerService", {
  useClass: CustomerService,
});
//______________ Payment module ______________________

// Register repositories
container.register<IPaymentRepository>("IPaymentRepository", {
  useClass: PaymentRepository,
});

// Register payment strategies
container.register("CashOnDeliveryPay", { useClass: CashOnDeliveryPay });
container.register("ChargiliPay", ChargiliPay);

// Register payment processor factory
container.register("PaymentProcessorFactory", {
  useClass: PaymentProcessorFactory,
});

// Register payment service
container.register<IPaymentService>("IPaymentService", {
  useClass: PaymentService,
});

//____________ Order module _________________

// Register order repository
container.register<IOrderRepository>("IOrderRepository", {
  useClass: OrderRepository,
});

// Register order service
container.register<IOrderService>("IOrderService", {
  useClass: OrderService,
});

// Register the CheckoutMediatorService
container.register<CheckoutMediatorService>("CheckoutMediatorService", {
  useClass: CheckoutMediatorService,
});


// Create a singleton instance of WebSocketService
const webSocketService = new WebSocketService();
container.registerInstance("WebSocketService", webSocketService);
export { container };
