import { injectable, inject } from "tsyringe";
import IOrderProcessingService from "./Interfaces/IOrderProcessingService";
import IMessengerService from "./Interfaces/IMessengerService";
import IProductService from "./Interfaces/IProductService";
import IConversationService from "./Interfaces/IConversationService";
import IOrderService from "./Interfaces/IOrderService";
import ICustomerService from "./Interfaces/ICustomerService";
import { ConversationState } from "@prisma/client";
import { ExtendedConversationState } from "../types/extended-conversation";

@injectable()
class OrderProcessingService implements IOrderProcessingService {
  constructor(
    @inject("IMessengerService") private messengerService: IMessengerService,
    @inject("IProductService") private productService: IProductService,
    @inject("IConversationService") private conversationService: IConversationService,
    @inject("IOrderService") private orderService: IOrderService,
    @inject("ICustomerService") private customerService: ICustomerService
  ) {}

  async handleProductSelection(
    senderId: string,
    productId: string,
    storeId: string
  ): Promise<void> {
    try {
      const product = await this.productService.findById(productId);
      if (!product) {
        await this.messengerService.sendTextMessage(
          senderId,
          "عذرًا، المنتج غير متوفر. يرجى اختيار منتج آخر."
        );
        await this.sendProductsForOrder(senderId, storeId);
        return;
      }

      await this.conversationService.updateConversation(senderId, {
        temp_product_id: productId,
        state: ConversationState.AWAITING_QUANTITY
      });

      await this.messengerService.sendTextMessage(
        senderId,
        `لقد اخترت: ${product.name}\nالسعر: ${product.price} ريال\n\nكم وحدة تريد؟ (أدخل رقمًا)`
      );
    } catch (error) {
      console.error("Error handling product selection:", error);
      await this.messengerService.sendTextMessage(
        senderId,
        "عذرًا، حدث خطأ أثناء اختيار المنتج. يرجى المحاولة مرة أخرى."
      );
    }
  }

  async handleQuantityInput(
    senderId: string,
    messageText: string,
    conversation: any
  ): Promise<void> {
    try {
      const quantity = parseInt(messageText);
      if (isNaN(quantity) || quantity <= 0) {
        await this.messengerService.sendTextMessage(
          senderId,
          "يرجى إدخال رقم صحيح أكبر من صفر."
        );
        return;
      }

      const product = await this.productService.findById(conversation.temp_product_id);
      if (!product) {
        await this.messengerService.sendTextMessage(
          senderId,
          "عذرًا، المنتج غير متوفر. يرجى بدء الطلب من جديد."
        );
        return;
      }

      if (product.inventory_count < quantity) {
        await this.messengerService.sendTextMessage(
          senderId,
          `عذرًا، الكمية المتوفرة من هذا المنتج هي ${product.inventory_count} فقط. يرجى اختيار كمية أقل.`
        );
        return;
      }

      await this.conversationService.updateConversation(senderId, {
        temp_quantity: quantity,
        state: ConversationState.AWAITING_CONFIRMATION
      });

      const totalPrice = parseFloat(product.price.toString()) * quantity;
      await this.sendOrderSummary(senderId, product, quantity, totalPrice);
    } catch (error) {
      console.error("Error handling quantity input:", error);
      await this.messengerService.sendTextMessage(
        senderId,
        "عذرًا، حدث خطأ أثناء معالجة الكمية. يرجى المحاولة مرة أخرى."
      );
    }
  }

  async handleOrderConfirmation(senderId: string): Promise<void> {
    try {
      const conversation = await this.conversationService.getConversation(senderId);
      if (!conversation || !conversation.temp_product_id || !conversation.temp_quantity) {
        await this.messengerService.sendTextMessage(
          senderId,
          "عذرًا، لا يمكن تأكيد الطلب. يرجى بدء الطلب من جديد."
        );
        return;
      }

      const product = await this.productService.findById(conversation.temp_product_id);
      if (!product) {
        await this.messengerService.sendTextMessage(
          senderId,
          "عذرًا، المنتج غير متوفر. يرجى بدء الطلب من جديد."
        );
        return;
      }

      const customerName = `Messenger User ${senderId.substring(0, 8)}`;
      const customer = await this.customerService.createCustomer({
        name: customerName,
        store_id: conversation.store_id,
        phone: null,
        email: null
      });

      const totalAmount = parseFloat(product.price.toString()) * conversation.temp_quantity;
      const order = await this.orderService.createOrder(
        {
          store_id: conversation.store_id,
          customer_id: customer.id,
          total_amount: totalAmount,
          payment_method: "cash_on_delivery",
          order_source: "messenger",
          customer_messenger_id: senderId,
          status: "pending"
        },
        [
          {
            product_id: conversation.temp_product_id,
            quantity: conversation.temp_quantity,
            unit_price: parseFloat(product.price.toString())
          }
        ]
      );

      // Customer service flow enabled after migration
      await this.conversationService.updateConversation(senderId, {
        temp_order_id: order.id,
        state: ExtendedConversationState.AWAITING_CUSTOMER_NAME as ConversationState
      });

      await this.messengerService.sendTextMessage(
        senderId,
        "تم إنشاء طلبك! لإكمال الطلب، نحتاج لبعض المعلومات الإضافية.\n\nيرجى إدخال اسمك الكامل:"
      );
    } catch (error) {
      console.error("Error confirming order:", error);
      await this.messengerService.sendTextMessage(
        senderId,
        "عذرًا، حدث خطأ أثناء تأكيد الطلب. يرجى المحاولة مرة أخرى."
      );
    }
  }

  async handleOrderCancellation(senderId: string): Promise<void> {
    try {
      await this.conversationService.deleteConversation(senderId);
      await this.messengerService.sendTextMessage(
        senderId,
        "تم إلغاء الطلب. يمكنك بدء طلب جديد في أي وقت."
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
    } catch (error) {
      console.error("Error cancelling order:", error);
      await this.messengerService.sendTextMessage(
        senderId,
        "عذرًا، حدث خطأ أثناء إلغاء الطلب. يرجى المحاولة مرة أخرى."
      );
    }
  }

  async handleCustomerNameInput(
    senderId: string,
    messageText: string,
    conversation: any
  ): Promise<void> {
    try {
      if (!conversation.temp_order_id) {
        await this.messengerService.sendTextMessage(
          senderId,
          "عذرًا، لا يمكن إكمال الطلب. يرجى بدء الطلب من جديد."
        );
        return;
      }

      if (!messageText.trim() || messageText.trim().length < 2) {
        await this.messengerService.sendTextMessage(
          senderId,
          "يرجى إدخال اسم صحيح (على الأقل حرفين):"
        );
        return;
      }

      await this.conversationService.updateConversation(senderId, {
        temp_customer_name: messageText.trim(),
        state: ExtendedConversationState.AWAITING_CUSTOMER_PHONE as ConversationState
      });

      await this.messengerService.sendTextMessage(
        senderId,
        `شكرًا ${messageText.trim()}! الآن يرجى إدخال رقم هاتفك للتواصل معك حول الطلب:`
      );
    } catch (error) {
      console.error("Error handling customer name input:", error);
      await this.messengerService.sendTextMessage(
        senderId,
        "عذرًا، حدث خطأ أثناء معالجة الاسم. يرجى المحاولة مرة أخرى."
      );
    }
  }

  async handleCustomerPhoneInput(
    senderId: string,
    messageText: string,
    conversation: any
  ): Promise<void> {
    try {
      if (!conversation.temp_order_id || !conversation.temp_customer_name) {
        await this.messengerService.sendTextMessage(
          senderId,
          "عذرًا، لا يمكن إكمال الطلب. يرجى بدء الطلب من جديد."
        );
        return;
      }

      // Basic phone validation
      const phoneRegex = /^[+]?[\d\s\-\(\)]{8,}$/;
      if (!phoneRegex.test(messageText.trim())) {
        await this.messengerService.sendTextMessage(
          senderId,
          "يرجى إدخال رقم هاتف صحيح:"
        );
        return;
      }

      await this.conversationService.updateConversation(senderId, {
        temp_customer_phone: messageText.trim(),
        state: ExtendedConversationState.AWAITING_CUSTOMER_EMAIL as ConversationState
      });

      await this.messengerService.sendTextMessage(
        senderId,
        "ممتاز! أخيرًا، يرجى إدخال بريدك الإلكتروني (أو اكتب 'تخطي' إذا كنت لا تريد تقديم البريد الإلكتروني):"
      );
    } catch (error) {
      console.error("Error handling customer phone input:", error);
      await this.messengerService.sendTextMessage(
        senderId,
        "عذرًا، حدث خطأ أثناء معالجة رقم الهاتف. يرجى المحاولة مرة أخرى."
      );
    }
  }

  async handleCustomerEmailInput(
    senderId: string,
    messageText: string,
    conversation: any
  ): Promise<void> {
    try {
      if (!conversation.temp_order_id || !conversation.temp_customer_name || !conversation.temp_customer_phone) {
        await this.messengerService.sendTextMessage(
          senderId,
          "عذرًا، لا يمكن إكمال الطلب. يرجى بدء الطلب من جديد."
        );
        return;
      }

      let email = null;
      const skipMessages = ['تخطي', 'skip', 'تخطى', 'لا أريد'];
      
      if (!skipMessages.includes(messageText.trim().toLowerCase())) {
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(messageText.trim())) {
          await this.messengerService.sendTextMessage(
            senderId,
            "يرجى إدخال بريد إلكتروني صحيح أو اكتب 'تخطي':"
          );
          return;
        }
        email = messageText.trim();
      }

      // Get order to find customer ID
      const order = await this.orderService.getOrderById(conversation.temp_order_id);
      if (!order) {
        await this.messengerService.sendTextMessage(
          senderId,
          "عذرًا، لا يمكن العثور على الطلب. يرجى بدء الطلب من جديد."
        );
        return;
      }

      // Update customer information
      await this.customerService.updateCustomer({
        id: order.customer_id,
        name: conversation.temp_customer_name,
        phone: conversation.temp_customer_phone,
        email: email
      });

      await this.conversationService.updateConversation(senderId, {
        state: ConversationState.AWAITING_ADDRESS
      });

      await this.messengerService.sendTextMessage(
        senderId,
        "ممتاز! تم حفظ معلوماتك بنجاح. الآن يرجى إدخال عنوان التوصيل:"
      );
    } catch (error) {
      console.error("Error handling customer email input:", error);
      await this.messengerService.sendTextMessage(
        senderId,
        "عذرًا، حدث خطأ أثناء معالجة البريد الإلكتروني. يرجى المحاولة مرة أخرى."
      );
    }
  }

  async handleAddressInput(
    senderId: string,
    messageText: string,
    conversation: any
  ): Promise<void> {
    try {
      if (!conversation.temp_order_id) {
        await this.messengerService.sendTextMessage(
          senderId,
          "عذرًا، لا يمكن إكمال الطلب. يرجى بدء الطلب من جديد."
        );
        return;
      }

      await this.orderService.updateOrder({
        id: conversation.temp_order_id,
        address: { text: messageText }
      });

      await this.conversationService.updateConversation(senderId, {
        state: ConversationState.COMPLETED
      });

      const customerName = conversation.temp_customer_name || `Messenger User ${senderId.substring(0, 8)}`;
      await this.messengerService.sendTextMessage(
        senderId,
        `تم تأكيد طلبك بنجاح يا ${customerName}! 🎉\n\n` +
        `رقم الطلب: ${conversation.temp_order_id}\n` +
        `سيتم توصيل طلبك إلى العنوان: ${messageText}\n` +
        `سيتم التواصل معك على رقم: ${conversation.temp_customer_phone || 'غير محدد'}\n\n` +
        `شكرًا لاستخدامك خدمتنا! 🙏`
      );

      setTimeout(async () => {
        try {
          await this.conversationService.deleteConversation(senderId);
        } catch (error) {
          console.error("Error deleting conversation:", error);
        }
      }, 60000);
    } catch (error) {
      console.error("Error handling address input:", error);
      await this.messengerService.sendTextMessage(
        senderId,
        "عذرًا، حدث خطأ أثناء معالجة العنوان. يرجى المحاولة مرة أخرى."
      );
    }
  }

  async sendProductsForOrder(senderId: string, storeId: string): Promise<void> {
    try {
      const products = await this.productService.findByStoreId(storeId);

      if (!products || products.length === 0) {
        await this.messengerService.sendTextMessage(
          senderId,
          "عذرًا، لا توجد منتجات متاحة حاليًا."
        );
        return;
      }

      const limitedProducts = products.slice(0, 9);
      const productCards = limitedProducts.map((product: any) => {
        let imageUrl;
        try {
          if (product.images) {
            const images = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
            imageUrl = Array.isArray(images) && images.length > 0 ? images[0] : undefined;
          }
        } catch (error) {
          console.error(`[OrderProcessingService] Error parsing images for product ${product.id}:`, error);
          imageUrl = undefined;
        }

        return {
          title: product.name,
          subtitle: `${product.price} ريال - المخزون: ${product.inventory_count}`,
          image_url: imageUrl,
          buttons: [
            {
              type: "postback",
              title: "اختيار المنتج",
              payload: `SELECT_PRODUCT_${product.id}`,
            },
          ],
        };
      });

      await this.messengerService.sendGenericTemplate(senderId, productCards);
    } catch (error) {
      console.error("[OrderProcessingService] Error sending products for order:", error);
      await this.messengerService.sendTextMessage(
        senderId,
        "عذرًا، حدث خطأ أثناء جلب المنتجات. يرجى المحاولة مرة أخرى."
      );
    }
  }

  private async sendOrderSummary(
    senderId: string,
    product: any,
    quantity: number,
    totalPrice: number
  ): Promise<void> {
    const summaryMessage =
      `ملخص الطلب:\n` +
      `المنتج: ${product.name}\n` +
      `السعر: ${product.price} ريال\n` +
      `الكمية: ${quantity}\n` +
      `المجموع: ${totalPrice.toFixed(2)} ريال\n\n` +
      `هل تريد تأكيد الطلب؟`;

    await this.messengerService.sendGenericTemplate(senderId, [
      {
        title: "تأكيد الطلب",
        subtitle: summaryMessage,
        buttons: [
          {
            type: "postback",
            title: "تأكيد الطلب ✅",
            payload: "CONFIRM_ORDER"
          },
          {
            type: "postback",
            title: "إلغاء الطلب ❌",
            payload: "CANCEL_ORDER"
          }
        ]
      }
    ]);
  }
}

export default OrderProcessingService; 