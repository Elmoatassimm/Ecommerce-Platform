import { injectable } from "tsyringe";
import axios from "axios";
import IMessengerService from "./Interfaces/IMessengerService";

@injectable()
class MessengerService implements IMessengerService {
  private readonly pageAccessToken: string;

  constructor() {
    this.pageAccessToken = process.env.PAGE_ACCESS_TOKEN || "";
    if (!this.pageAccessToken) {
      throw new Error("PAGE_ACCESS_TOKEN is not defined in environment variables");
    }
  }

  async sendTextMessage(senderId: string, message: string): Promise<void> {
    try {
      const url = `https://graph.facebook.com/v22.0/me/messages?access_token=${this.pageAccessToken}`;
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

  async sendQuickReplies(
    senderId: string,
    message: string,
    quickReplies: any[]
  ): Promise<void> {
    try {
      const url = `https://graph.facebook.com/v22.0/me/messages?access_token=${this.pageAccessToken}`;
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

  async sendGenericTemplate(senderId: string, elements: any[]): Promise<void> {
    try {
      const url = `https://graph.facebook.com/v22.0/me/messages?access_token=${this.pageAccessToken}`;
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

  async sendPlatformLink(senderId: string): Promise<void> {
    await this.sendTextMessage(
      senderId,
      "يمكنك تصفح المنصة من هنا: https://your-platform.com"
    );
  }
}

export default MessengerService; 