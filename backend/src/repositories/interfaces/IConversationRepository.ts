import { Conversation, ConversationState } from "@prisma/client";

export default interface IConversationRepository {
  create(data: { psid: string; store_id: string }): Promise<Conversation>;
  findByPsid(psid: string): Promise<Conversation | null>;
  update(data: {
    psid: string;
    state?: ConversationState;
    temp_product_id?: string | null;
    temp_quantity?: number | null;
    temp_order_id?: string | null;
    temp_customer_name?: string | null;
    temp_customer_phone?: string | null;
    temp_customer_email?: string | null;
  }): Promise<Conversation>;
  delete(psid: string): Promise<Conversation>;
}
