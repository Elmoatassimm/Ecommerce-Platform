import { injectable, inject,delay } from "tsyringe";
import IOrderRepository from "../repositories/interfaces/IOrederRepository";
import IOrderService from "./Interfaces/IOrderService";
import {
  TOrderCreate,
  TOrderItems,
  TOrderItemsCreate,
  TOrderUpdate,
   TFindInput
} from "../types/types";
import { Order, Prisma, OrderStatus } from "@prisma/client";
import handlePrismaError from "../utils/handlePrismaErrors";
import { InternalServerError, NotFoundError } from "../types/errors";
import IProductRepository from "../repositories/interfaces/IProductRepository";
import IProductService from "./Interfaces/IProductService";
import WebhookService from "./webhook.service";
@injectable()
export default class OrderService implements IOrderService {
  constructor(
    @inject("IOrderRepository") private orderRepository: IOrderRepository,
    @inject("IProductService") private productService: IProductService,
    @inject(delay(() => WebhookService)) private webhookService: WebhookService
  
  ) {}

  async createOrder(data: TOrderCreate, orderItems: TOrderItems) {
    try {







      return this.orderRepository.create(data, orderItems);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      console.log("ERRROR", error);
      if (error instanceof Prisma.PrismaClientKnownRequestError)
        handlePrismaError(error, { resource: "Order" });

      throw new InternalServerError("Failed to create order");
    }
  }


  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
    try {
      const order = await this.orderRepository.getOrderById(orderId);
      if (!order) {
        throw new NotFoundError("Order not found", orderId);
      }

      if (status === OrderStatus.cancelled) {
        // When an order is cancelled, increase the inventory for each item.
        const itemsToUpdate = order.order_items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          updateType: "increase" as const,
        }));
        await this.productService.updateInventory(itemsToUpdate);
      }

      return await this.orderRepository.update({ id: orderId, status });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        handlePrismaError(error, { resource: "Order", id: orderId });
      }
      throw new InternalServerError("Failed to update order status");
    }
  }

  /**
   * Updates an order's status and sends a notification via Messenger if applicable.
   * @param orderId - The ID of the order to update
   * @param status - The new status for the order
   * @returns The updated order
   */
  async updateOrderStatusWithNotification(orderId: string, status: OrderStatus): Promise<Order> {
    try {
      // First, get the order to check if it has a messenger ID
      const order = await this.orderRepository.getOrderById(orderId);
      if (!order) {
        throw new NotFoundError("Order not found", orderId);
      }

      // Update the order status using the existing method
      const updatedOrder = await this.updateOrderStatus(orderId, status);

      // Send notification to customer via Messenger if customer_messenger_id exists
      if (order.customer_messenger_id) {
        try {
          await this.webhookService.sendOrderStatusUpdate(
            order.customer_messenger_id,
            orderId,
            status
          );
        } catch (notificationError) {
          // Log the error but don't fail the order status update
          console.error("Failed to send order status notification:", notificationError);
        }
      }

      return updatedOrder;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        handlePrismaError(error, { resource: "Order", id: orderId });
      }
      throw new InternalServerError("Failed to update order status with notification");
    }
  }


  async updateOrder(data: TOrderUpdate) {
    try {
      return await this.orderRepository.update(data);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError)
        handlePrismaError(error, { resource: "Order" });
      throw new InternalServerError("Failed to update order");
    }
  }

  async deleteOrder(id: string) {
    try {
      return await this.orderRepository.delete(id);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError)
        handlePrismaError(error, { resource: "Order", id });
      throw new InternalServerError("Failed to delete order");
    }
  }

  async getStoreOrders(data: TFindInput) {
    try {
      return await this.orderRepository.getStoreOrders(data);
    } catch (error) {
      console.log(error);
      if (error instanceof Prisma.PrismaClientKnownRequestError)
        handlePrismaError(error, { resource: "Order"  });
      throw new InternalServerError("Failed to retrieve store orders");
    }
  }

  async getOrderById(id: string) {
    try {
      return await this.orderRepository.getOrderById(id);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError)
        handlePrismaError(error, { resource: "Order", id });
      throw new InternalServerError("Failed to retrieve order");
    }
  }
}
