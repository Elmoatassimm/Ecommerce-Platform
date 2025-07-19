import { Router, Request, Response } from "express";
import PaymentController from "../controllers/payment.controller";
import { container } from "tsyringe";

const paymentWebhookRouter = Router();
const paymentController = container.resolve(PaymentController);



paymentWebhookRouter.post("/", (req: Request, res: Response) => {
  paymentController.handleWebhook(req, res);
});

export default paymentWebhookRouter;
