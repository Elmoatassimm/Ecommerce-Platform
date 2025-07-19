import { PrismaClient, Conversation, ConversationState } from "@prisma/client";
import { injectable, inject } from "tsyringe";
import db from "../config/db";
import IConversationRepository from "./interfaces/IConversationRepository";

@injectable()
export default class ConversationRepository implements IConversationRepository {
  private prisma: PrismaClient;

  constructor(@inject("db") private prismaService: db) {
    this.prisma = prismaService.getClient();
  }

  async create(data: { psid: string; store_id: string }): Promise<Conversation> {
    return this.prisma.conversation.create({
      data,
    });
  }

  async findByPsid(psid: string): Promise<Conversation | null> {
    return this.prisma.conversation.findUnique({
      where: { psid },
    });
  }

  async update(data: {
    psid: string;
    state?: ConversationState;
    temp_product_id?: string | null;
    temp_quantity?: number | null;
    temp_order_id?: string | null;
    temp_customer_name?: string | null;
    temp_customer_phone?: string | null;
    temp_customer_email?: string | null;
  }): Promise<Conversation> {
    const { psid, ...updateData } = data;
    return this.prisma.conversation.update({
      where: { psid },
      data: updateData,
    });
  }

  async delete(psid: string): Promise<Conversation> {
    return this.prisma.conversation.delete({
      where: { psid },
    });
  }
}
