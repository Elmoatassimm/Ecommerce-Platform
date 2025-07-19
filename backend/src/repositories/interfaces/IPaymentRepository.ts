
import { Payment } from "@prisma/client";
import { TPaymentCreate,TPaymentCreateWithTransactionId,TPaymentUpdate } from "../../types/types";

export default interface IPaymentRepository {
  create(data: TPaymentCreateWithTransactionId): Promise<Payment>;
  updateByOrderId (data: TPaymentUpdate): Promise<Payment>;
  
}
