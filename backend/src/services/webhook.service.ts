import axios from "axios";
import { inject, injectable } from "tsyringe";
import IProductService from "./Interfaces/IProductService";

@injectable()
class WebhookService {
  constructor(
    @inject("IProductService") private productService: IProductService
  ) {}

  /**
   * Processes the incoming event and calls the appropriate handler.
   */
  async processEvent(event: any): Promise<void> {
    if (event.message) {
      await this.handleMessage(event);
    } else if (event.postback) {
      await this.handlePostback(event);
    }
  }

  /**
   * Handles a received message event.
   * If the message contains a quick reply payload, forward it to the postback handler.
   * Otherwise, sends a set of quick reply buttons including options to fetch products,
   * browse the platform, create an order, create a customer, or view new ideas.
   * @param event - The incoming message event
   */
  private async handleMessage(event: any): Promise<void> {
    const senderId = event.sender.id;

    if (event.message.quick_reply) {
      const payload = event.message.quick_reply.payload;
      console.log(`Quick reply from sender ${senderId}: ${payload}`);
      await this.handlePostback({ sender: event.sender, postback: { payload } });
    } else {
      const messageText = event.message.text;
      console.log(`Message from sender ${senderId}: ${messageText}`);

      // Send quick replies with additional options for order, customer, and new ideas.
      await this.sendQuickReplies(senderId, "كيف يمكنني مساعدتك؟", [
        {
          content_type: "text",
          title: "جلب المنتجات 🛍️",
          payload: "FETCH_PRODUCTS",
        },
        {
          content_type: "text",
          title: "تصفح المنصة 🌐",
          payload: "BROWSE_PLATFORM",
        },
        {
          content_type: "text",
          title: "إنشاء طلب 🛒",
          payload: "CREATE_ORDER",
        },
        {
          content_type: "text",
          title: "إنشاء عميل 👤",
          payload: "CREATE_CUSTOMER",
        },
        {
          content_type: "text",
          title: "أفكار جديدة 💡",
          payload: "NEW_IDEAS",
        },
      ]);
    }
  }

  /**
   * Handles a postback event by logging it and triggering the appropriate response.
   * @param event - The incoming postback event
   */
  private async handlePostback(event: any): Promise<void> {
    const senderId = event.sender.id;
    const payload = event.postback.payload;
    console.log(`Postback from sender ${senderId}: ${payload}`);

    if (payload === "FETCH_PRODUCTS") {
      await this.sendProducts(senderId);
    } else if (payload === "BROWSE_PLATFORM") {
      await this.sendPlatformLink(senderId);
    } else if (payload === "CREATE_ORDER") {
      await this.createOrder(senderId);
    } else if (payload === "CREATE_CUSTOMER") {
      await this.createCustomer(senderId);
    } else if (payload === "NEW_IDEAS") {
      await this.sendNewIdeas(senderId);
    }
  }

  /**
   * Sends Quick Replies to the user.
   * @param senderId - The PSID of the recipient
   * @param message - The text message to send
   * @param quickReplies - Array of quick reply objects
   */
  private async sendQuickReplies(
    senderId: string,
    message: string,
    quickReplies: any[]
  ): Promise<void> {
    try {
      const pageAccessToken = process.env.PAGE_ACCESS_TOKEN;
      if (!pageAccessToken) {
        throw new Error(
          "PAGE_ACCESS_TOKEN is not defined in environment variables"
        );
      }

      const url = `https://graph.facebook.com/v22.0/me/messages?access_token=${pageAccessToken}`;
      const payload = {
        recipient: { id: senderId },
        messaging_type: "RESPONSE",
        message: {
          text: message,
          quick_replies: quickReplies,
        },
      };

      const response = await axios.post(url, payload, {
        headers: { "Content-Type": "application/json" },
      });
      console.log("Quick Replies sent successfully:", response.data);
    } catch (error: any) {
      console.error(
        "Error sending Quick Replies:",
        error.response ? error.response.data : error.message
      );
    }
  }

  /**
   * Sends a list of products to the user.
   * @param senderId - The PSID of the recipient
   */
  private async sendProducts(senderId: string): Promise<void> {
    try {
      // Fetch products from the ProductService using the store ID.
      const storeId = "b7864295-5c6f-4d74-ad7b-481ea075d59a";
      const products = await this.productService.findByStoreId(storeId);

      if (!products || products.length === 0) {
        console.log("No products found for the given store ID.");
        await this.sendTextMessage(senderId, "عذرًا، لا توجد منتجات متاحة حاليًا.");
        return;
      }

      const productCards = products.map((product: any) => {
        // Construct a product URL using the product id.
        const productUrl = `https://your-platform.com/products/${product.id}`;
        return {
          title: product.name,
          subtitle: `${product.price} ريال`,
          buttons: [
            {
              type: "web_url",
              url: productUrl,
              title: "عرض المنتج",
            },
          ],
        };
      });

      await this.sendGenericTemplate(senderId, productCards);
    } catch (error: any) {
      console.error(
        "Error sending products:",
        error.response ? error.response.data : error.message
      );
    }
  }

  /**
   * Sends a generic template (carousel) to the user.
   * @param senderId - The PSID of the recipient
   * @param elements - Array of elements to display
   */
  private async sendGenericTemplate(senderId: string, elements: any[]): Promise<void> {
    try {
      const pageAccessToken = process.env.PAGE_ACCESS_TOKEN;
      if (!pageAccessToken) {
        throw new Error("PAGE_ACCESS_TOKEN is not defined in environment variables");
      }
      const url = `https://graph.facebook.com/v22.0/me/messages?access_token=${pageAccessToken}`;
      const payload = {
        recipient: { id: senderId },
        messaging_type: "RESPONSE",
        message: {
          attachment: {
            type: "template",
            payload: {
              template_type: "generic",
              elements: elements,
            },
          },
        },
      };
      const response = await axios.post(url, payload, {
        headers: { "Content-Type": "application/json" },
      });
      console.log("Generic Template sent successfully:", response.data);
    } catch (error: any) {
      console.error(
        "Error sending Generic Template:",
        error.response ? error.response.data : error.message
      );
    }
  }

  /**
   * Sends a link to browse the platform.
   * @param senderId - The PSID of the recipient
   */
  private async sendPlatformLink(senderId: string): Promise<void> {
    await this.sendTextMessage(
      senderId,
      "يمكنك تصفح المنصة من هنا: https://your-platform.com"
    );
  }

  /**
   * Sends a text message to the user.
   * @param senderId - The PSID of the recipient
   * @param message - The text message to send
   */
  private async sendTextMessage(senderId: string, message: string): Promise<void> {
    try {
      const pageAccessToken = process.env.PAGE_ACCESS_TOKEN;
      if (!pageAccessToken) {
        throw new Error("PAGE_ACCESS_TOKEN is not defined in environment variables");
      }
      const url = `https://graph.facebook.com/v22.0/me/messages?access_token=${pageAccessToken}`;
      const payload = {
        recipient: { id: senderId },
        messaging_type: "RESPONSE",
        message: { text: message },
      };
      const response = await axios.post(url, payload, {
        headers: { "Content-Type": "application/json" },
      });
      console.log("Message sent successfully:", response.data);
    } catch (error: any) {
      console.error(
        "Error sending message:",
        error.response ? error.response.data : error.message
      );
    }
  }

  // --- New Functionality ---

  /**
   * Simulates the creation of an order with one item.
   * Fetches a product from the store and creates an order containing that product.
   * @param senderId - The PSID of the recipient
   */
  private async createOrder(senderId: string): Promise<void> {
    try {
      // Fetch products from the ProductService using the store ID.
      const storeId = "c49c3d38-bafa-414b-a620-27703987aa4e";
      const products = await this.productService.findByStoreId(storeId);
      console.log(products)

      if (!products || products.length === 0) {
        await this.sendTextMessage(senderId, "عذرًا، لا توجد منتجات متاحة لإنشاء الطلب.");
        return;
      }

      // For this example, select the first product as the order item.
      const product = products[0];
      const orderId = Math.floor(Math.random() * 1000000);

      const orderMessage = 
        `تم إنشاء طلبك بنجاح!\n` +
        `رقم الطلب: ${orderId}\n` +
        `العنصر: ${product.name}\n` +
        `السعر: ${product.price} ريال\n` +
        `الكمية: 1`;

      await this.sendTextMessage(senderId, orderMessage);
    } catch (error: any) {
      console.error(
        "Error creating order:",
        error.response ? error.response.data : error.message
      );
    }
  }

  /**
   * Simulates the creation of a customer and sends a confirmation message.
   * @param senderId - The PSID of the recipient
   */
  private async createCustomer(senderId: string): Promise<void> {
    // For demonstration purposes, generate a random customer ID.
    const customerId = Math.floor(Math.random() * 1000000);
    // In a real application, integrate with your customer management service.
    await this.sendTextMessage(
      senderId,
      `تم إنشاء حساب عميل جديد! رقم العميل: ${customerId}`
    );
  }

  /**
   * Sends a list of new ideas or suggestions to the user.
   * @param senderId - The PSID of the recipient
   */
  private async sendNewIdeas(senderId: string): Promise<void> {
    const ideas = [
      "عرض خاص اليوم",
      "توصيل مجاني للطلبات الكبيرة",
      "تجربة المنتجات الجديدة",
    ];
    const ideasMessage =
      "بعض الأفكار الجديدة:\n" +
      ideas.map((idea, index) => `${index + 1}. ${idea}`).join("\n");
    await this.sendTextMessage(senderId, ideasMessage);
  }
}

export default WebhookService;
