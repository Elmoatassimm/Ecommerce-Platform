import { injectable, inject } from "tsyringe";
import { Request, Response, NextFunction } from "express";
import ICustomerService from "../services/Interfaces/ICustomerService";
import ResponseUtils from "../utils/response.utils";
import { RequestWithUser, TCustomerCreate, TCustomerUpdate, TFindInput } from "../types/types";

@injectable()
export class CustomerController {
  constructor(
    @inject("ICustomerService") private customerService: ICustomerService,
    @inject("responseUtils") private responseUtils: ResponseUtils
  ) {} 

  async createCustomer(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
      const data: TCustomerCreate = {
        ...req.body,
        store_id: req.user.storeId,
      };
      const result = await this.customerService.createCustomer(data);
       this.responseUtils.sendSuccessResponse(res, result, 201);
    } catch (error) {
      next(error);
    }
  }

  async updateCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      const data: TCustomerUpdate = {
        ...req.body,
        id: req.params.customerId,
      };
      const result = await this.customerService.updateCustomer(data);
       this.responseUtils.sendSuccessResponse(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getCustomerWithOrders(req: Request, res: Response, next: NextFunction) {
    try {
     
      const { customerId } = req.params;
      const result = await this.customerService.getCustomerWithOrders(
        customerId
      );
       this.responseUtils.sendSuccessResponse(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getStoreCustomers(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
      
      const storeId = req.user.storeId;
    const data:TFindInput = { ...req.queryParams, storeId }; // Merge parsed query params with storeId

     
  
      const result = await this.customerService.getStoreCustomers(
        data
      );
  
      this.responseUtils.sendSuccessResponse(res, result);
    } catch (error) {
      next(error);
    }
  }
  
}
