export default interface IWebhookService {
  processEvent(event: any): Promise<void>;
  sendOrderStatusUpdate(psid: string, orderId: string, status: string): Promise<void>;
} 