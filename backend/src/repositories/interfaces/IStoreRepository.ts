import { Product, Store } from "@prisma/client";
import {
  TStoreUpdate,
  TStoreWithProducts,
  TStoreCreate,
  TFindInput,
  TPagination,
} from "../../types/types";
import { NotFoundError } from "../../types/errors";

export default interface IStoreRepository {
  create(storeData: TStoreCreate): Promise<Store>;
  update(storeData: TStoreUpdate): Promise<Store | null>;
  getOnlyStore(storeId: string): Promise<Store | null>
  getStoreByIdWithProducts(data: TFindInput): Promise<{
    store: Store;
    products: Product[];
    pagination: TPagination;
  } | null> 
  getStoreByName(name: string): Promise<Store | null>;
}
