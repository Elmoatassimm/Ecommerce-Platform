import { container, inject, injectable } from "tsyringe";
import IStoreRepository from "./interfaces/IStoreRepository";
import { TStoreUpdate, TStoreWithProducts, TStoreCreate, TFindInput } from "../types/types";
import db from "../config/db";
import { PrismaClient, Store } from "@prisma/client";
import { AppError, ConflictError, NotFoundError } from "../types/errors";

@injectable()
export default class StoreRepository implements IStoreRepository {
  private prisma: PrismaClient;

  constructor(@inject("db") private prismaService: db) {
    this.prisma = prismaService.getClient();
  }

  async create(storeData: TStoreCreate) {
    // Check if the user already owns a store
    const existingStore = await this.prisma.store.findUnique({
      where: { owner_id: storeData.owner_id },
    });

    if (existingStore)
      throw new ConflictError("This user already owns a store.");

    // Create new store if the user doesn't have one
    return this.prisma.store.create({
      data: storeData,
    });
  }

  async update(storeData: TStoreUpdate) {
    return this.prisma.store.update({
      where: { id: storeData.id },
      data: storeData,
    });
    
  }
  async getOnlyStore(storeId: string){
    return this.prisma.store.findUnique(
      { 
        where: { id: storeId },
        include: {
          owner: {
            select: {
              id: true,
              email: true,
              username: true,
            },
              },
            },
          });

  }
  async getStoreByIdWithProducts(data: TFindInput) {
    
    const where: any = { store_id: data.storeId };
  
    // 🔍 Search logic: Product name case-insensitive search
    if (data.search) {
      where.products = {
        some: { name: { contains: data.search, mode: "insensitive" } },
      };
    }
  
    // 🔽 Fetch store with products (pagination, search, sorting)
    const store = await this.prisma.store.findUnique({
      where: { id: data.storeId },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            username: true,
          },
        },
        products: {
          where: where.products,
          skip: data.skip,
          take: data.limit,
          orderBy: {
            [data.sortBy ?? "createdAt"]: data.order ?? "desc",
          },
          include: {
            category: true,
          },
        },
      },
    });
  
    if (!store) return null;
  
    // 📊 Get total count of matching products
    const totalProducts = await this.prisma.product.count({ where: where.products });
  
    return {
      store,
      products: store.products,
      pagination: {
        totalCount: totalProducts,
        totalPages: Math.ceil(totalProducts / data.limit),
        currentPage: data.page,
        perPage: data.limit,
      },
    };
  }
  

  async getStoreByName(name: string) {
    return this.prisma.store.findFirst({
      where: { name },
    });
  }
}
