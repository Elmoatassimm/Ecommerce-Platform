import "reflect-metadata";
import express, { Application, Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import morgan from "morgan";
import routes from "./routes";
import webhookRoutes from "./routes/meta.webhook.routes";
import { container } from "./config/container";
import ResponseUtils from "./utils/response.utils";
import GlobalErrorHandler from "./middlewares/errors.middlware";
import listEndpoints from "express-list-endpoints";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { TFindInput } from "./types/types"; // Adjust path as needed
import crypto from "crypto"
import dotenv from "dotenv";
import "./config/container"; // Import container configuration

dotenv.config();

const app: Application = express();

// Trust proxy - Add this before rate limiter
app.set('trust proxy', 1);

declare module "express-serve-static-core" {
  interface Request {
    queryParams: TFindInput;
  }
}

// Configure rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  headers: true,
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply rate limiter globally
app.use(limiter);

// Enable CORS for all routes
app.use(cors());

app.use(helmet());

// Middleware to parse JSON
app.use(bodyParser.urlencoded({ extended: true }));
//@ts-ignore
app.use(bodyParser.json({verify:(req,res,buf)=>{req.rawBody =buf;},}));

// Use morgan for logging HTTP requests
//app.use(morgan("dev")); // You can use "dev" for a shorter output

app.use("/api/v1", routes);
app.use("/webhook", webhookRoutes);

// ======================
// 404 Handler
// ======================
app.use("*", (req, res, next) => {
  const responseUtils = container.resolve(ResponseUtils);
  responseUtils.sendNotFoundResponse(res, "Endpoint not found");
  next();
});

// ======================
// Global Error Handler
// ======================
const globalErrorHandler = container.resolve(GlobalErrorHandler);
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  globalErrorHandler.handle(err, req, res, next);
});

// routes list
 //console.log(listEndpoints(app));

// Start the server
const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;
