import { Router, Request, Response } from "express";
import WebhookController from "../controllers/webhook.controller";
import { container } from "tsyringe";

const webhookRouter = Router();
const webhookController = container.resolve(WebhookController);

webhookRouter.get("/", (req: Request, res: Response) => {
  webhookController.verifyWebhook(req, res);
});

webhookRouter.post("/", (req: Request, res: Response) => {
  webhookController.handleWebhookEvent(req, res);
});

export default webhookRouter;
