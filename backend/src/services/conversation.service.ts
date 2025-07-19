import { injectable, inject } from "tsyringe";
import { Conversation, ConversationState, Prisma } from "@prisma/client";
import IConversationRepository from "../repositories/interfaces/IConversationRepository";
import IConversationService from "./Interfaces/IConversationService";
import { InternalServerError, NotFoundError } from "../types/errors";
import handlePrismaError from "../utils/handlePrismaErrors";

@injectable()
export default class ConversationService implements IConversationService {
  constructor(
    @inject("IConversationRepository") private conversationRepo: IConversationRepository
  ) {}

  async createOrUpdateConversation(
    psid: string, 
    storeId: string, 
    data?: {
      state?: ConversationState;
      temp_product_id?: string | null;
      temp_quantity?: number | null;
      temp_order_id?: string | null;
      temp_customer_name?: string | null;
      temp_customer_phone?: string | null;
      temp_customer_email?: string | null;
    }
  ): Promise<Conversation> {
    try {
      // Check if conversation exists
      const existingConversation = await this.conversationRepo.findByPsid(psid);
      
      if (existingConversation) {
        // Update existing conversation
        return this.updateConversation(psid, data || {});
      } else {
        // Create new conversation
        const newConversation = await this.conversationRepo.create({
          psid,
          store_id: storeId,
        });
        
        // If data is provided, update the newly created conversation
        if (data && Object.keys(data).length > 0) {
          return this.updateConversation(psid, data);
        }
        
        return newConversation;
      }
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        handlePrismaError(error, { resource: "Conversation" });
      }
      throw new InternalServerError("Failed to create or update conversation");
    }
  }

  async getConversation(psid: string): Promise<Conversation | null> {
    try {
      return await this.conversationRepo.findByPsid(psid);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        handlePrismaError(error, { resource: "Conversation" });
      }
      throw new InternalServerError("Failed to retrieve conversation");
    }
  }

  async updateConversation(
    psid: string, 
    data: {
      state?: ConversationState;
      temp_product_id?: string | null;
      temp_quantity?: number | null;
      temp_order_id?: string | null;
      temp_customer_name?: string | null;
      temp_customer_phone?: string | null;
      temp_customer_email?: string | null;
    }
  ): Promise<Conversation> {
    try {
      const conversation = await this.conversationRepo.findByPsid(psid);
      if (!conversation) {
        throw new NotFoundError("Conversation not found", psid);
      }
      
      // All fields now supported after migration
      return await this.conversationRepo.update({
        psid,
        ...data,
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        handlePrismaError(error, { resource: "Conversation" });
      }
      throw new InternalServerError("Failed to update conversation");
    }
  }

  async deleteConversation(psid: string): Promise<Conversation> {
    try {
      const conversation = await this.conversationRepo.findByPsid(psid);
      if (!conversation) {
        throw new NotFoundError("Conversation not found", psid);
      }
      
      return await this.conversationRepo.delete(psid);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        handlePrismaError(error, { resource: "Conversation" });
      }
      throw new InternalServerError("Failed to delete conversation");
    }
  }
}
