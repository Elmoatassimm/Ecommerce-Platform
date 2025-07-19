import { Request, Response } from "express";
import { injectable, inject } from "tsyringe";
import WebhookService from "../services/webhook.service";

@injectable()
class WebhookController {
  // Set your verify token and app secret (ideally via environment variables)
  private readonly VERIFY_TOKEN: string = process.env.VERIFY_TOKEN || "";

  constructor(
    @inject(WebhookService) private webhookService: WebhookService
  ) {}

  /**
   * Verifies the webhook using the token provided in the query parameters.
   */
  verifyWebhook(req: Request, res: Response): void {
    const mode = req.query["hub.mode"] as string;
    const token = req.query["hub.verify_token"] as string;
    const challenge = req.query["hub.challenge"] as string;

    if (mode && token) {
      if (mode === "subscribe" && token === this.VERIFY_TOKEN) {
        console.log("WEBHOOK_VERIFIED");
        res.status(200).send(challenge);
      } else {
        res.sendStatus(403);
      }
    } else {
      res.sendStatus(400);
    }
  }

  /**
   * Handles incoming webhook events by passing each event to the WebhookService.
   */
  async handleWebhookEvent(req: Request, res: Response): Promise<void> {
    console.log("Received webhook event");
    const body = req.body;
    
    // Validate webhook payload structure
    if (!body || !body.entry || !Array.isArray(body.entry) || body.entry.length === 0) {
      console.error("Invalid webhook payload structure");
      res.sendStatus(400);
      return;
    }

    const entry = body.entry[0];
    if (!entry.messaging || !Array.isArray(entry.messaging) || entry.messaging.length === 0) {
      console.error("Invalid messaging array in webhook payload");
      res.sendStatus(400);
      return;
    }

    const messaging = entry.messaging;
    const pageId = messaging[0]?.recipient?.id;

    if (!pageId) {
      console.error("Page ID not found in webhook payload");
      res.sendStatus(400);
      return;
    }

    console.log("messaging", messaging);
    console.log("pageId", pageId);

    if (body.object === "page") {
      // Process each entry in the webhook payload
      for (const entry of body.entry) {
        for (const event of entry.messaging) {
          await this.webhookService.processEvent(event);
        }
      }
      res.status(200).send("EVENT_RECEIVED");
    } else {
      res.sendStatus(404);
    }
  }
}

export default WebhookController;
