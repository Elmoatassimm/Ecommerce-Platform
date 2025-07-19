import { injectable, inject } from "tsyringe";
import { PrismaClient } from "@prisma/client";
import IWebhookService from "./Interfaces/IWebhookService";
import IMessengerService from "./Interfaces/IMessengerService";
import IOrderProcessingService from "./Interfaces/IOrderProcessingService";
import IConversationService from "./Interfaces/IConversationService";
import db from "../config/db";
import { ConversationState } from "@prisma/client";
import { ExtendedConversationState } from "../types/extended-conversation";

@injectable()
class WebhookService implements IWebhookService {
  private prisma: PrismaClient;

  constructor(
    @inject("IMessengerService") private messengerService: IMessengerService,
    @inject("IOrderProcessingService") private orderProcessingService: IOrderProcessingService,
    @inject("IConversationService") private conversationService: IConversationService,
    @inject("db") private prismaService: db
  ) {
    this.prisma = prismaService.getClient();
    console.log("[WebhookService] Service initialized");
  }

  async processEvent(event: any): Promise<void> {
    console.log("[WebhookService] Processing new event:", JSON.stringify(event, null, 2));
    try {
      if (!event || !event.sender?.id || !event.recipient?.id) {
        console.error("[WebhookService] Invalid event structure:", event);
        return;
      }

      const senderId = event.sender.id;
      const pageId = event.recipient.id;
      console.log(`[WebhookService] Processing event for sender: ${senderId}, page: ${pageId}`);

      // Handle echo messages (messages sent by the page)
      if (event.message?.is_echo) {
        console.log("[WebhookService] Ignoring echo message");
        return;
      }

      // Handle delivery receipts
      if (event.delivery) {
        console.log("[WebhookService] Ignoring delivery receipt");
        return;
      }

      // Handle read receipts
      if (event.read) {
        console.log("[WebhookService] Ignoring read receipt");
        return;
      }

      if (event.message) {
        console.log("[WebhookService] Handling message event");
        await this.handleMessage(event);
      } else if (event.postback) {
        console.log("[WebhookService] Handling postback event");
        await this.handlePostback(event);
      } else {
        console.warn("[WebhookService] Unhandled event type:", event);
      }
    } catch (error) {
      console.error("[WebhookService] Error processing webhook event:", error);
    }
  }

  private async handleMessage(event: any): Promise<void> {
    try {
      const senderId = event.sender.id;
      const pageId = event.recipient.id;
      console.log(`[WebhookService] Handling message from sender: ${senderId}`);

      const storeId = await this.getStoreIdFromPageId(pageId);
      console.log(`[WebhookService] Retrieved store ID: ${storeId} for page: ${pageId}`);
      
      if (!storeId) {
        console.error(`[WebhookService] No store found for page ID: ${pageId}`);
        await this.messengerService.sendTextMessage(senderId, "عذرًا، حدث خطأ في النظام. يرجى المحاولة لاحقًا.");
        return;
      }

      if (event.message.quick_reply) {
        const payload = event.message.quick_reply.payload;
        console.log(`[WebhookService] Quick reply received from ${senderId} with payload: ${payload}`);
        await this.handlePostback({ sender: event.sender, postback: { payload }, recipient: event.recipient });
        return;
      }

      const conversation = await this.conversationService.getConversation(senderId);
      const messageText = event.message.text;
      console.log(`[WebhookService] Message from ${senderId}: "${messageText}"`);
      console.log(`[WebhookService] Current conversation state:`, conversation?.state || 'No conversation');

      if (!conversation) {
        console.log(`[WebhookService] Creating new conversation for sender: ${senderId}`);
        await this.conversationService.createOrUpdateConversation(
          senderId,
          storeId
        );

        await this.messengerService.sendQuickReplies(senderId, "كيف يمكنني مساعدتك؟", [
          {
            content_type: "text",
            title: "طلب جديد 🛒",
            payload: "START_ORDER",
          },
          {
            content_type: "text",
            title: "تصفح المنصة 🌐",
            payload: "BROWSE_PLATFORM",
          },
        ]);
        return;
      }

      console.log(`[WebhookService] Processing message in state: ${conversation.state}`);
      switch (conversation.state as any) {
        case ConversationState.AWAITING_QUANTITY:
          console.log(`[WebhookService] Processing quantity input: ${messageText}`);
          await this.orderProcessingService.handleQuantityInput(senderId, messageText, conversation);
          break;

        case ConversationState.AWAITING_ADDRESS:
          console.log(`[WebhookService] Processing address input: ${messageText}`);
          await this.orderProcessingService.handleAddressInput(senderId, messageText, conversation);
          break;

        case ExtendedConversationState.AWAITING_CUSTOMER_NAME:
          console.log(`[WebhookService] Processing customer name input: ${messageText}`);
          await this.orderProcessingService.handleCustomerNameInput(senderId, messageText, conversation);
          break;

        case ExtendedConversationState.AWAITING_CUSTOMER_PHONE:
          console.log(`[WebhookService] Processing customer phone input: ${messageText}`);
          await this.orderProcessingService.handleCustomerPhoneInput(senderId, messageText, conversation);
          break;

        case ExtendedConversationState.AWAITING_CUSTOMER_EMAIL:
          console.log(`[WebhookService] Processing customer email input: ${messageText}`);
          await this.orderProcessingService.handleCustomerEmailInput(senderId, messageText, conversation);
          break;

        default:
          console.log(`[WebhookService] Sending default quick replies to ${senderId}`);
          await this.messengerService.sendQuickReplies(senderId, "كيف يمكنني مساعدتك؟", [
            {
              content_type: "text",
              title: "طلب جديد 🛒",
              payload: "START_ORDER",
            },
            {
              content_type: "text",
              title: "تصفح المنصة 🌐",
              payload: "BROWSE_PLATFORM",
            },
          ]);
      }
    } catch (error) {
      console.error("[WebhookService] Error handling message:", error);
      await this.messengerService.sendTextMessage(event.sender.id, "عذرًا، حدث خطأ في النظام. يرجى المحاولة لاحقًا.");
    }
  }

  private async handlePostback(event: any): Promise<void> {
    try {
      const senderId = event.sender.id;
      const pageId = event.recipient.id;
      const payload = event.postback.payload || event.postback?.payload;
      
      console.log(`[WebhookService] Processing postback from ${senderId} with payload: ${payload}`);
      
      if (!payload) {
        console.error("[WebhookService] No payload found in postback event");
        return;
      }

      const storeId = await this.getStoreIdFromPageId(pageId);
      console.log(`[WebhookService] Retrieved store ID: ${storeId} for page: ${pageId}`);
      
      if (!storeId) {
        console.error(`[WebhookService] No store found for page ID: ${pageId}`);
        await this.messengerService.sendTextMessage(senderId, "عذرًا، حدث خطأ في النظام. يرجى المحاولة لاحقًا.");
        return;
      }

      if (payload === "START_ORDER" || payload === "FETCH_PRODUCTS") {
        console.log(`[WebhookService] Starting new order process for ${senderId}`);
        await this.conversationService.createOrUpdateConversation(
          senderId,
          storeId,
          { state: ConversationState.AWAITING_PRODUCT_SELECTION }
        );
        await this.orderProcessingService.sendProductsForOrder(senderId, storeId);
      } else if (payload === "BROWSE_PLATFORM") {
        console.log(`[WebhookService] Sending platform link to ${senderId}`);
        await this.messengerService.sendPlatformLink(senderId);
      } else if (payload.startsWith("SELECT_PRODUCT_")) {
        const productId = payload.replace("SELECT_PRODUCT_", "");
        console.log(`[WebhookService] Processing product selection: ${productId} for ${senderId}`);
        await this.orderProcessingService.handleProductSelection(senderId, productId, storeId);
      } else if (payload === "CONFIRM_ORDER") {
        console.log(`[WebhookService] Processing order confirmation for ${senderId}`);
        await this.orderProcessingService.handleOrderConfirmation(senderId);
      } else if (payload === "CANCEL_ORDER") {
        console.log(`[WebhookService] Processing order cancellation for ${senderId}`);
        await this.orderProcessingService.handleOrderCancellation(senderId);
      } else {
        console.warn(`[WebhookService] Unhandled postback payload: ${payload}`);
        await this.messengerService.sendTextMessage(
          senderId,
          "عذرًا، لم أفهم هذا الطلب. يرجى المحاولة مرة أخرى."
        );
      }
    } catch (error) {
      console.error("[WebhookService] Error handling postback:", error);
      await this.messengerService.sendTextMessage(event.sender.id, "عذرًا، حدث خطأ في النظام. يرجى المحاولة لاحقًا.");
    }
  }

  private async getStoreIdFromPageId(pageId: string): Promise<string | null> {
    try {
      console.log(`[WebhookService] Looking up store ID for page: ${pageId}`);
      const metaIntegration = await this.prisma.metaIntegration.findFirst({
        where: { page_id: pageId }
      });

      if (!metaIntegration) {
        console.error(`[WebhookService] No meta integration found for page ID: ${pageId}`);
        return null;
      }

      console.log(`[WebhookService] Found store ID: ${metaIntegration.store_id} for page: ${pageId}`);
      return metaIntegration.store_id;
    } catch (error) {
      console.error(`[WebhookService] Error getting store ID from page ID ${pageId}:`, error);
      return null;
    }
  }

  async sendOrderStatusUpdate(psid: string, orderId: string, status: string): Promise<void> {
    try {
      console.log(`[WebhookService] Sending order status update for order ${orderId} to ${psid}: ${status}`);
      let statusMessage = "";

      switch (status) {
        case "processing":
          statusMessage = "جاري تجهيز طلبك";
          break;
        case "shipped":
          statusMessage = "تم شحن طلبك وهو في الطريق إليك";
          break;
        case "delivered":
          statusMessage = "تم توصيل طلبك بنجاح";
          break;
        case "cancelled":
          statusMessage = "تم إلغاء طلبك";
          break;
        default:
          statusMessage = "تم تحديث حالة طلبك";
      }

      const message = `تحديث حالة الطلب #${orderId}:\n${statusMessage}`;
      console.log(`[WebhookService] Sending message: ${message}`);
      await this.messengerService.sendTextMessage(psid, message);
    } catch (error) {
      console.error("[WebhookService] Error sending order status update:", error);
    }
  }
}

export default WebhookService;
