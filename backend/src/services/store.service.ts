import { injectable, inject } from "tsyringe";
import IStoreService from "./Interfaces/IStoreService";
import IStoreRepository from "../repositories/interfaces/IStoreRepository";
import { TFindInput, TStoreCreate, TStoreUpdate } from "../types/types";
import {
  NotFoundError,
  ConflictError,
  InternalServerError,
  BadRequestError,
} from "../types/errors";
import { Prisma } from "@prisma/client";
import { handlePrismaError } from "../utils/handlePrismaErrors";

@injectable()
export default class StoreService implements IStoreService {
  constructor(
    @inject("IStoreRepository") private storeRepository: IStoreRepository,
  ) {}

  async createStore(storeData: TStoreCreate) {
    try {
      // Check for existing store (repository should implement this)
      const existingStore = await this.storeRepository.getStoreByName(
        storeData.name,
      );
      if (existingStore)
        throw new ConflictError(
          `Store with name ${storeData.name} already exists`,
        );

      return await this.storeRepository.create(storeData);
    } catch (error) {
      if (error instanceof ConflictError) throw error;

      throw new InternalServerError("Failed to create store");
    }
  }

  async updateStore(storeData: TStoreUpdate) {
    try {
      return this.storeRepository.update(storeData);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError)
        handlePrismaError(error, { resource: "Store", id: storeData.id });

      throw new InternalServerError("Failed to update store");
    }
  }


  async getStoreByIdWithProducts(data:TFindInput) {
    try {
      return this.storeRepository.getStoreByIdWithProducts(data);
    } catch (error) {
  

      if (error instanceof Prisma.PrismaClientKnownRequestError)
        handlePrismaError(error, { resource: "Store" });

      throw new InternalServerError("Failed to retrieve store");
    }
  }
  async getStoreById(storeId: string){
    try {
      const store = await this.storeRepository.getOnlyStore(storeId);
      if (!store) throw new NotFoundError(`Store with id ${storeId} not found`);
      return store;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new InternalServerError("Failed to retrieve store");
    }
  }
}
