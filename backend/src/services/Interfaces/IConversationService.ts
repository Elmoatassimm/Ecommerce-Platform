import { Conversation, ConversationState } from "@prisma/client";

export default interface IConversationService {
  createOrUpdateConversation(psid: string, storeId: string, data?: {
    state?: ConversationState;
    temp_product_id?: string | null;
    temp_quantity?: number | null;
    temp_order_id?: string | null;
    temp_customer_name?: string | null;
    temp_customer_phone?: string | null;
    temp_customer_email?: string | null;
  }): Promise<Conversation>;
  
  getConversation(psid: string): Promise<Conversation | null>;
  
  updateConversation(psid: string, data: {
    state?: ConversationState;
    temp_product_id?: string | null;
    temp_quantity?: number | null;
    temp_order_id?: string | null;
    temp_customer_name?: string | null;
    temp_customer_phone?: string | null;
    temp_customer_email?: string | null;
  }): Promise<Conversation>;
  
  deleteConversation(psid: string): Promise<Conversation>;
}
