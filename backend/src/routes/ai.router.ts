import { Router } from "express";
import { container } from "tsyringe";
import AIController from "../controllers/ai.controller";
import authMiddleware from "../middlewares/auth.middlware";

const router = Router();
const aiController = container.resolve(AIController);

// Route for generating social media captions for a specific product
router.post(
  "/social-captions/:productId", 
  authMiddleware,
  async (req, res, next): Promise<void> => { await aiController.generateSocialCaptions(req, res, next) }
);

// Route for general AI text generation
router.post(
  "/generate",
  authMiddleware,
  async (req, res, next): Promise<void> => {aiController.generateResponse(req, res, next)}
);

export default router;
