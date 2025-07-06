import { Router, Request, Response, NextFunction } from "express";
import { container } from "../config/container";
import StoreController from "../controllers/store.controller";
import authMiddleware from "../middlewares/auth.middlware";
import { validateRequest } from "../middlewares/RequestValidation.middlware";
import {
  storeCreateSchema,
  storeUpdateSchema,
} from "../validations/store.validation";
import CategoryController from "../controllers/category.controller";
import { createCategorySchema } from "../validations/product.validation";
import ChargiliAccountController from "../controllers/chargiliAccount.controller";
import { ChargiliAccountCreateSchema } from "../validations/chargiliAccount.validation";
import MetaController from "../controllers/meta.controller";
import {
  metaCreateSchema,
  metaUpdateSchema,
} from "../validations/meta.validation";
import { CustomerController } from "../controllers/customer.controller";
import {
  customerCreateSchema,
  customerUpdateSchema,
} from "../validations/custemer.validation";
import parseQueryParams from "../middlewares/parseQueryParams.middlware";
import { request } from "http";

const storeRouter = Router();
const storeController = container.resolve(StoreController);
const categoryController = container.resolve(CategoryController);
const chargiliAccountController = container.resolve(ChargiliAccountController);
const metaController = container.resolve(MetaController);


storeRouter.post(
  "/",
  authMiddleware,
  validateRequest(storeCreateSchema),

  (req: Request, res: Response, next: NextFunction) =>
    storeController.createStore(req, res, next),
);

storeRouter.put(
  "/:id",
  authMiddleware,
  validateRequest(storeUpdateSchema),

  (req: Request, res: Response, next: NextFunction) =>
    storeController.updateStore(req, res, next),
);

storeRouter.get("/:id",parseQueryParams, (req: Request, res: Response, next: NextFunction) =>
  storeController.getStoreByIdWithProducts(req, res, next),
);

/*storeRouter.get(
  "/:id",
  authMiddleware,
  (req: Request, res: Response, next: NextFunction) => storeController.getStoreById(req, res, next)
)*/

// Create Category
storeRouter.post(
  "/categories",
  authMiddleware,
  validateRequest(createCategorySchema),

  (req: Request, res: Response, next: NextFunction) =>
    categoryController.create(req, res, next),
);

// List Categories
storeRouter.get(
  "/:storeId/categories",
  (req: Request, res: Response, next: NextFunction) =>
    categoryController.list(req, res, next),
);

// Delete Category
storeRouter.delete(
  "/categories/:id",
  authMiddleware,
  (req: Request, res: Response, next: NextFunction) =>
    categoryController.delete(req, res, next),
);

storeRouter.post(
  "/payments/chargili",
  authMiddleware,
  validateRequest(ChargiliAccountCreateSchema),
  (req: Request, res: Response, next: NextFunction) =>
    chargiliAccountController.setupPayment(req, res, next),
);

storeRouter.delete(
  "/payments/chargili",
  authMiddleware,
  (req: Request, res: Response, next: NextFunction) =>
    chargiliAccountController.deletePaymentSetup(req, res, next),
);

storeRouter.patch(
  "/payments/chargili",
  authMiddleware,
  validateRequest(ChargiliAccountCreateSchema),
  (req: Request, res: Response, next: NextFunction) =>
    chargiliAccountController.updatePaymentSetup(req, res, next),
);

// Meta Integration Routes
storeRouter.post(
  "/meta-setup",
  authMiddleware,
  validateRequest(metaCreateSchema),
  (req: Request, res: Response, next: NextFunction) =>
    metaController.create(req, res, next),
);

storeRouter.put(
  "/meta-setup",
  authMiddleware,
  validateRequest(metaUpdateSchema),
  (req: Request, res: Response, next: NextFunction) =>
    metaController.update(req, res, next),
);

storeRouter.delete(
  "/meta-setup",
  authMiddleware,
  (req: Request, res: Response, next: NextFunction) =>
    metaController.delete(req, res, next),
);


export default storeRouter;
