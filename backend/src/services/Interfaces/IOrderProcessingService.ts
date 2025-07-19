export default interface IOrderProcessingService {
  handleProductSelection(senderId: string, productId: string, storeId: string): Promise<void>;
  handleQuantityInput(senderId: string, messageText: string, conversation: any): Promise<void>;
  handleOrderConfirmation(senderId: string): Promise<void>;
  handleOrderCancellation(senderId: string): Promise<void>;
  handleAddressInput(senderId: string, messageText: string, conversation: any): Promise<void>;
  handleCustomerNameInput(senderId: string, messageText: string, conversation: any): Promise<void>;
  handleCustomerPhoneInput(senderId: string, messageText: string, conversation: any): Promise<void>;
  handleCustomerEmailInput(senderId: string, messageText: string, conversation: any): Promise<void>;
  sendProductsForOrder(senderId: string, storeId: string): Promise<void>;
} 