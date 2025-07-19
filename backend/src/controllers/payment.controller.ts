import { Request, Response } from "express";
import { inject, injectable } from "tsyringe";

import IChargiliAccountService from "../services/Interfaces/IChargiliAccountService"; 
import crypto from "crypto"

import IPaymentService from "../services/Interfaces/IPaymentService";
import IOrderService from "../services/Interfaces/IOrderService";
import IProductService from "../services/Interfaces/IProductService";
import { PaymentStatus, OrderStatus } from '@prisma/client';

@injectable()
export default class PaymentController {

 
  constructor(
   @inject("IChargiliAccountService") private chargiliAccountService: IChargiliAccountService ,
   @inject("IPaymentService") private paymentService: IPaymentService,
   @inject("IOrderService") private orderService: IOrderService,
   @inject("IProductService") private productService: IProductService
  ) {}



  
  async handleWebhook(req: Request, res: Response): Promise<any> {
    console.log("webhook");
    
    // Extracting the 'signature' header from the HTTP request
    const signature = req.get('signature');
    

    // Getting the raw payload from the request body
    //@ts-ignore
    const payload = req.rawBody.toString('utf8');
    

    // If there is no signature, ignore the request
    if (!signature) {
        return res.sendStatus(400);
    }

    const apiSecretKey = await this.chargiliAccountService.getSecretKeyByStoreID(req.body.data.metadata.store_id);
    if (!apiSecretKey) {
        return res.sendStatus(400);
    }
 

    // Calculate the signature
    const computedSignature = crypto.createHmac('sha256', apiSecretKey)
        .update(payload)
        .digest('hex');
    
    

    // If the calculated signature doesn't match the received signature, ignore the request
    if (computedSignature !== signature) {
        return res.sendStatus(403);
    }

    const event = req.body;
    console.log("event", event);

    switch (event.type) {
      case 'checkout.paid':
        const checkout = event.data;
        const order_id = req.body.data.metadata.order_id;
        const store_id = req.body.data.metadata.store_id;

        // Update payment status to successful
        await this.paymentService.updatePayment({
          order_id,
          status: PaymentStatus.successful, // Assuming PaymentStatus has a success value
        });

        break;

      case 'checkout.failed':
        const failedCheckout = event.data;
        const failedOrder_id = req.body.data.metadata.order_id;
        const failedStore_id = req.body.data.metadata.store_id;

        // Update order status to cancelled
        await this.orderService.updateOrderStatus(failedOrder_id, OrderStatus.cancelled);

        // Update payment status to failed
        await this.paymentService.updatePayment({
          order_id: failedOrder_id,
          status: PaymentStatus.failed, // Assuming PaymentStatus has a failed value
        });

        break;
    }

    res.sendStatus(200);
  }
}
