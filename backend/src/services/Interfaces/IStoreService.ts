import { Store ,Product} from "@prisma/client";
import {
  TStoreUpdate,
  TStoreWithProducts,
  TStoreCreate,
  TPagination,
  TFindInput
} from "../../types/types";

export default interface IStoreService {
  createStore(storeData: TStoreCreate): Promise<Store>;
  updateStore(storeData: TStoreUpdate): Promise<Store | null>;
  getStoreById(storeId: string): Promise<Store | null>;
  getStoreByIdWithProducts(data:TFindInput):  Promise<{
    store: Store;
    products: Product[];
    pagination: TPagination;
  } | null>;
}
