// src/repositories/products.cache.repo.ts
import { injectable, inject } from "tsyringe";
import { Product } from "@prisma/client";
import IProductRepository from "./interfaces/IProductRepository";
import { RedisClient } from "../config/redis";
import { NotFoundError } from "../types/errors";

@injectable()
export default class ProductsCacheRepository {
  constructor(
    @inject("RedisClient") private redisClient: RedisClient,
    @inject("IProductRepository") private productRepository: IProductRepository
  ) {}

  /**
   * Read-through strategy:
   * 1. Attempt to get the products list from Redis.
   * 2. If not found, query the database, cache the result, and return it.
   */
  async getProductsByStoreId(store_id: string): Promise<Product[]> {
    const cacheKey = `store:${store_id}:products`;
   
    const cachedData = await this.redisClient.get(cacheKey);
    if (cachedData) {
      console.log(`Returning cached products for store ${store_id}`);
      return JSON.parse(cachedData) as Product[];
    }

    // If not cached, fetch from the database
    const products = await this.productRepository.findByStoreId(store_id);
    if (!products) throw new NotFoundError("Products", store_id);

    // Cache the result for 300 seconds (5 minutes)
    await this.redisClient.setex(cacheKey, 3000, JSON.stringify(products));
    return products;
  }

  /**
   * Remove the cached products for a store.
   */
  async invalidateProductsCache(store_id: string ): Promise<void> {
    const cacheKey = `store:${store_id}:products`;
    await this.redisClient.del(cacheKey);
  }
}
