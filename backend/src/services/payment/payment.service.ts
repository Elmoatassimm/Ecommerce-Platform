import { injectable, inject } from "tsyringe";
import IPaymentRepository from "../../repositories/interfaces/IPaymentRepository";
import { TPaymentCreate, TPaymentUpdate } from "../../types/types";
import PaymentProcessorFactory from "./payment.factory";
import {
  NotFoundError,
  BadRequestError,
  InternalServerError,
} from "../../types/errors";
import { PaymentStatus, Prisma } from "@prisma/client";
import handlePrismaError from "../../utils/handlePrismaErrors";
import IChargiliAccountRepository from "../../repositories/interfaces/IChargiliAccountRepository";
import { string } from "zod";
import IPaymentService from "../Interfaces/IPaymentService";

@injectable()
export class PaymentService implements IPaymentService  {
  constructor(
    @inject("IPaymentRepository") private paymentRepository: IPaymentRepository,
    @inject("PaymentProcessorFactory")
    private paymentProcessorFactory: PaymentProcessorFactory
  ) {}

  async createPayment(data: TPaymentCreate, secret_key: string) {
    try {
      // Get the appropriate payment processor
      const processor = this.paymentProcessorFactory.getProcessor(
        data.payment_method
      );

      // Process the payment
      const processorResponse = await processor.processPayment(
        data.amount,
        secret_key
      );

      // Create payment record with processor response

      const paymentData = {
        ...data,
        status: processorResponse.success
          ? PaymentStatus.pending
          : PaymentStatus.failed,
        gateway_response: processorResponse.gateway_response,
      };
console.log("paymentData",paymentData)
      const payment = await this.paymentRepository.create(paymentData);
      const checkout_url: string =
        processorResponse.gateway_response.checkout_url;
      return checkout_url;
    } catch (error) {
      if (error instanceof BadRequestError) throw error;
      throw new InternalServerError("Failed to create payment");
    }
  }

  async updatePayment(data: TPaymentUpdate) {
    try {
      return await this.paymentRepository.updateByOrderId(data);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError)
        handlePrismaError(error, { resource: "Payment" });

      if (error instanceof NotFoundError) throw error;
      throw new InternalServerError("Failed to update payment status");
    }
  }
}
