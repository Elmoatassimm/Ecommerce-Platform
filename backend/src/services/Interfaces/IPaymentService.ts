
import { TPaymentCreate, TPaymentUpdate } from "../../types/types";
import { Payment, PaymentMethod, PaymentStatus } from "@prisma/client";


export default interface IPaymentService {
  

   createPayment(data: TPaymentCreate, secret_key: string,store_id:string): Promise<string>;
   updatePayment(data: TPaymentUpdate): Promise<Payment> ;
   
    
}
