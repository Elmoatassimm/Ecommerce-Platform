import { injectable } from "tsyringe";
import IPaymentStrategy from "../Interfaces/IPaymentStrategy";
import { InternalServerError } from "../../types/errors";
import { Decimal } from "@prisma/client/runtime/library";

@injectable()
export default class ChargiliPay implements IPaymentStrategy {
  async processPayment(amount: Decimal, secret_key: string, metaData: { store_id: string; order_id: string }) {
    try {
      const options = {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secret_key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: amount.toNumber(),
          currency: "dzd",
          success_url: "https://google.com",
          metadata: { store_id: metaData.store_id, order_id: metaData.order_id },
          
        }),
      };

      const response = await fetch(
        "https://pay.chargily.net/test/api/v2/checkouts",
        options
      );
      console.log("response", response);
      if (!response.ok) {
        throw new InternalServerError("Failed to process Chargili payment");
      }

      return { success: true, gateway_response: await response.json() };
    } catch (error) {
      throw new InternalServerError("Failed to process Chargili payment");
    }
  }
}
