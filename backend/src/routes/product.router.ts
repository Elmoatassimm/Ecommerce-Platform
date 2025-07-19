import { Router, Request, Response, NextFunction } from "express";
import { container } from "../config/container";
import ProductController from "../controllers/product.controller";
import { validateRequest } from "../middlewares/RequestValidation.middlware";
import authMiddleware from "../middlewares/auth.middlware";
import {
  createProductSchema,
  updateProductSchema,
  storeIdParamSchema,
} from "../validations/product.validation";
import imagesMiddleware from "../middlewares/images.middlware";

import ImageUtils from "../utils/images.utils";

const router = Router();
const productController = container.resolve(ProductController);
const imageUtils = container.resolve(ImageUtils);

router.post(
  "/",
  authMiddleware,
  imagesMiddleware,
  validateRequest(createProductSchema),

  (req, res, next: NextFunction) => productController.create(req, res, next),
);

router.put(
  "/:id",
  authMiddleware,
  imagesMiddleware,
  validateRequest(updateProductSchema),
  (req, res, next: NextFunction) => productController.update(req, res, next),
);

router.delete("/:id", authMiddleware, (req, res, next: NextFunction) =>
  productController.delete(req, res, next),
);

router.get("/:id", (req, res, next: NextFunction) =>
  productController.getById(req, res, next),
);

router.get("/stores/:storeId", (req, res, next: NextFunction) =>
  productController.getByStoreId(req, res, next),
);

router.get("/images/:imageName", imageUtils.getImage);

export default router;
