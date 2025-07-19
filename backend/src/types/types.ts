import {
  User,
  Store,
  Product,
  Category,
  MetaIntegration,
  ChargiliAccount,
  Prisma,
  Customer,
  Order,
  Payment,
  OrderItem,
  PaymentMethod,
  PaymentStatus,
} from "@prisma/client";
import { Decimal, JsonValue } from "@prisma/client/runtime/library";
import { Request } from "express";

// __________________ Auth types _____________________

export interface TUserWithStore extends User {
  store: { id: string } | null;
}

export interface TAuthToken {
  accessToken: string;
  refreshToken: string;
}

export type RequestWithUser = Request & { user?: any };

//________________ Store types _______________________

export interface TStoreWithProducts extends Store {
  owner: Omit<User, "password_hash" | "created_at" | "updated_at">;
  products: TProductWithCategory;
}

export type TStoreCreate = Omit<
  Store,
  | "id"
  | "created_at"
  | "updated_at"
  | "meta_integration_status"
  | "payment_setup_status"
>;

export type TStoreUpdate = Partial<Store>;

//________________ Product types _______________________

export type TProductWithCategory = Prisma.ProductGetPayload<{
  include: {
    category: true;
  };
}>;

export type TProductCreate = Omit<
  Prisma.ProductCreateInput,
  "id" | "created_at" | "updated_at"
> & {
  images?: Prisma.InputJsonValue | null;
  
};


export type TProductUpdate = {
  id: string; // Required for updates
  name?: string;
  description?: string | null;
  price?: Decimal;
  category_id?: string | null;
  inventory_count?: number;
  images?: JsonValue;
  store_id: string; // Keep store_id as required
};

//________________ Categoey types _______________________

export type TCategoryCreate = Omit<
  Category,
  "id" | "created_at" | "updated_at"
>;

//________________ MetaIntegration types _______________________

export type TMetaIntegration = Omit<
  MetaIntegration,
  "id" | "store_id" | "created_at" | "updated_at"
>;
export type TMetaIntegrationCreate = Omit<
  MetaIntegration,
  "id" | "created_at" | "updated_at"
>;
export type TMetaIntegrationUpdate = Partial<TMetaIntegrationCreate>;

//________________ Chagrgili Account types _______________________

export type TChargiliAccountCreate = Omit<
  ChargiliAccount,
  "id" | "created_at" | "updated_at"
>;

//________________Customer Types _______________________
export type TCustomerCreate = Omit<
  Customer,
  "id" | "created_at" | "updated_at"
>;

export type TCustomerUpdate = Partial<TCustomerCreate> & { id: string };

export type TCustomerWithOrders = Customer & {
  orders: Order[];
};

//_________________ Payment types _______________________
export type TPaymentCreate = {
  order_id: string;
  amount: Decimal;
  payment_method: PaymentMethod;
  status: PaymentStatus;
  gateway_response?: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput;
};

export type TPaymentCreateWithTransactionId = TPaymentCreate & {
  transaction_id: string;
};

export type TPaymentUpdate = Partial<TPaymentCreate> & { order_id: string };

//_________________ Order types _______________________
export type TOrderCreate = Omit<Prisma.OrderUncheckedCreateInput, "id" | "created_at" | "updated_at"> & {
  customer_email?: string;
  customer_phone?: string;
};

export type TOrderUpdate = Partial<Prisma.OrderUncheckedCreateInput>;

export type TOrderWithProductsAndCustomer = Order & {
  order_items: OrderItem[];
  customer: Customer;
};
export type TOrderItemsCreate = {
  product_id: string;
  quantity: number;
  unit_price: number;
};
export type TOrderItems = {product_id:string,quantity:number,unit_price:number}[];

export type TOrderWithItems = Order & { order_items: OrderItem[] };

export type TPlaceOrderData = {
  customer:TCustomerCreate,
  order:TOrderCreate,
  items:{id:string,quantity:number}[],
  contact_info?: {
    email?: string;
    phone?: string;
  }
};





export type TPagination = {
  totalCount: number;
  totalPages: number;
  currentPage: number;
  perPage: number;
};


export type TFindInput = {
  storeId: string;
  page: number;  // Defaults to 1
  limit: number; // Defaults to 10
  search: string;
  sortBy: string; // Sorting field
  order: "asc" | "desc"; // Sorting order
  skip:number,
};







export type TGetStoreOrders = {
  orders: TOrderWithProductsAndCustomer[];
  pagination: TPagination;
};

