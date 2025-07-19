import { Prisma, Payment, PrismaClient } from "@prisma/client";
import  IPaymentRepository  from "./interfaces/IPaymentRepository";
import { TPaymentCreate, TPaymentCreateWithTransactionId, TPaymentUpdate } from "../types/types";
import { inject, injectable } from "tsyringe";
import db from "../config/db";

@injectable()
export default class PaymentRepository implements  IPaymentRepository { 
          private prisma: PrismaClient;

          constructor(@inject("db") private prismaService: db) {
            this.prisma = prismaService.getClient();
          }

  async create(data: TPaymentCreateWithTransactionId): Promise<Payment> {
   
    return this.prisma.payment.create({
      data,
    });
  }

  async updateByOrderId(data: TPaymentUpdate): Promise<Payment> { 
   

    return await this.prisma.payment.update({
      where: { order_id :data.order_id },
      data: data as Prisma.PaymentUpdateInput,
    });
  }

  
}