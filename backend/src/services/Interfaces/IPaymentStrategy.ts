import { Decimal } from '@prisma/client/runtime/library';

export default interface IPaymentStrategy {
  processPayment(amount: Decimal,secret_key: string,metaData?:object): Promise<{
    success: boolean;
   
    gateway_response: any;
  }>;
}