import { Request, Response, NextFunction } from "express";
import { injectable, inject } from "tsyringe";
import IOrderService from "../services/Interfaces/IOrderService";
import { RequestWithUser, TOrderCreate, TOrderUpdate, TOrderItemsCreate, TOrderItems, TPlaceOrderData, TFindInput } from "../types/types";
import ResponseUtils from "../utils/response.utils";
import CheckoutMediatorService from "../services/checkoutMediator.service";
import {OrderStatus } from "@prisma/client"
@injectable()
export class OrderController {
  constructor(
    @inject("IOrderService") private orderService: IOrderService,
    @inject(ResponseUtils) private responseUtils: ResponseUtils,
    @inject("CheckoutMediatorService") private checkoutMed:CheckoutMediatorService

  ) {}

  async createOrder(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
      const { contact_info, ...orderData } = req.body;
      
      // Add contact info to order if provided
      const orderWithContact = {
        ...orderData,
        order: {
          ...orderData.order,
          customer_email: contact_info?.email,
          customer_phone: contact_info?.phone
        }
      };

      const order = await this.checkoutMed.processCheckout(orderWithContact);
      this.responseUtils.sendSuccessResponse(res, order, 201);
    } catch (error) {
      next(error);
    }
  }

  async updateOrder(req: RequestWithUser  , res: Response, next: NextFunction) {
    try {
      const orderData: TOrderUpdate = {...req.body,id:req.params.id};
      const order = await this.orderService.updateOrder(orderData);
       this.responseUtils.sendSuccessResponse(res, order);
    } catch (error) {
      next(error);
    }
  }

  async deleteOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await this.orderService.deleteOrder(id);
       this.responseUtils.sendSuccessNoDataResponse(res, "Order deleted", 204);
    } catch (error) {
      next(error);
    }
  }

  async getStoreOrders(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
      const storeId = req.user.storeId;
    const data:TFindInput = { ...req.queryParams, storeId }; // Merge parsed query params with storeId

  
      // ✅ Fetch orders using the validated query params
      const orders = await this.orderService.getStoreOrders(data);
  
      // ✅ Send success response
      this.responseUtils.sendSuccessResponse(res, orders);
    } catch (error) {
      next(error);
    }
  }
  

  async getOrderById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const order = await this.orderService.getOrderById(id);
       this.responseUtils.sendSuccessResponse(res, order);
    } catch (error) {
      next(error);
    }
  }

  async updateOrderStatus(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body as { status: OrderStatus };
      const order = await this.orderService.updateOrderStatus(id, status);
      this.responseUtils.sendSuccessResponse(res, order);
    } catch (error) {
      next(error);
    }
  }
}

export default OrderController; 