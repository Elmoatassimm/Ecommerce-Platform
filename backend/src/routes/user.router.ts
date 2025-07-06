import { Router, Request, Response, NextFunction } from "express";
import { container } from "../config/container";
import UserController from "../controllers/user.controller";
import { validateRequest } from "../middlewares/RequestValidation.middlware";
import {
  userLoginSchema,
  userRegistrationSchema,
} from "../validations/user.validation";
import authMiddleware from "../middlewares/auth.middlware";

const userRouter = Router();
const userController = container.resolve(UserController);

userRouter.post(
  "/login",
  validateRequest(userLoginSchema),
  (req: Request, res: Response, next: NextFunction) => {
    userController.login(req, res, next);
  },
);
userRouter.post(
  "/register",
  validateRequest(userRegistrationSchema),
  (req: Request, res: Response, next: NextFunction) =>
    userController.register(req, res, next),
);

userRouter.post(
  "/refresh-token",
  (req: Request, res: Response, next: NextFunction) =>
    userController.refreshToken(req, res, next),
);

userRouter.post(
  "/logout",
  authMiddleware,
  (req: Request, res: Response, next: NextFunction) =>
    userController.logout(req, res, next),
);

userRouter.get(
  "/me",
  authMiddleware,

  (req: Request, res: Response, next: NextFunction) =>
    userController.retrieve(req, res, next),
)
userRouter.get(
  "/validate",
  authMiddleware,

  (req: Request, res: Response, next: NextFunction) =>
    userController.validateToken(req, res, next),
)
export default userRouter;
