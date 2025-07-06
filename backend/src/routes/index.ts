import { Router } from "express";
import userRoutes from "./user.router";
import storeRoutes from "./store.router";
import productRoutes from "./product.router";
import customerRoutes from "./customer.router";
import orderRouter from "./order.router";
import webhookRouter from "./webhook.routes";
import aiRouter from "./ai.router";

const router = Router();

router.use("/auth", userRoutes);
router.use("/stores", storeRoutes);
router.use("/products", productRoutes);
router.use("/customers", customerRoutes);
router.use("/orders", orderRouter);
router.use("/webhook", webhookRouter);
router.use("/ai", aiRouter);

export default router;
