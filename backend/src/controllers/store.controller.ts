import { Request, Response, NextFunction } from "express";
import { inject, injectable } from "tsyringe";
import IStoreService from "../services/Interfaces/IStoreService";
import { TStoreCreate, TStoreUpdate, RequestWithUser, TFindInput } from "../types/types";
import ResponseUtils from "../utils/response.utils";

@injectable()
export default class StoreController {
  constructor(
    @inject("IStoreService") private storeService: IStoreService,
    @inject("responseUtils") private responseUtils: ResponseUtils,
  ) {}

  async createStore(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
      const storeData: TStoreCreate = {
        ...req.body,
        owner_id: req.user.userId,
      };

      const newStore = await this.storeService.createStore(storeData);
      this.responseUtils.sendSuccessResponse(res, newStore, 201);
    } catch (error: any) {
      next(error);
    }
  }

  async updateStore(req: Request, res: Response, next: NextFunction) {
    try {
      const storeData: TStoreUpdate = { ...req.body, id: req.params.id };

      const updatedStore = await this.storeService.updateStore(storeData);

      this.responseUtils.sendSuccessResponse(res, updatedStore);
    } catch (error: any) {
      next(error);
    }
  }
  async getStoreById(req: Request, res: Response, next: NextFunction){
    try {
      const storeId = req.params.id;
      const store = await this.storeService.getStoreById(storeId);

      this.responseUtils.sendSuccessResponse(res, store);
    } catch (error) {
      
    }
  }
  async getStoreByIdWithProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const storeId = req.params.id;

      const data:TFindInput = { ...req.queryParams, storeId }; // Merge parsed query params with storeId

  
      const store = await this.storeService.getStoreByIdWithProducts(data);

      this.responseUtils.sendSuccessResponse(res, store);
    } catch (error: any) {
      next(error);
    }
  }
}
