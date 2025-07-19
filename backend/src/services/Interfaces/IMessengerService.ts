export default interface IMessengerService {
  sendTextMessage(senderId: string, message: string): Promise<void>;
  sendQuickReplies(senderId: string, message: string, quickReplies: any[]): Promise<void>;
  sendGenericTemplate(senderId: string, elements: any[]): Promise<void>;
  sendPlatformLink(senderId: string): Promise<void>;
} 