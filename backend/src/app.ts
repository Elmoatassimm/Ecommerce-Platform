import "reflect-metadata";
import express, { Application, Request, Response, NextFunction } from "express";
import { createServer } from "http";
import bodyParser from "body-parser";
import cors from "cors";
import routes from "./routes";
import webhookRoutes from "./routes/webhook.routes";
import { container } from "./config/container";
import WebSocketService from "./services/websocket.service";
import ResponseUtils from "./utils/response.utils";
import GlobalErrorHandler from "./middlewares/errors.middlware";
import listEndpoints from "express-list-endpoints";

import { TFindInput } from "./types/types"; // Adjust path as needed


const app: Application = express();
const httpServer = createServer(app);  // Create HTTP server

// Initialize WebSocket service with the HTTP server
const webSocketService = container.resolve<WebSocketService>("WebSocketService");
webSocketService.initialize(httpServer);

declare module "express-serve-static-core" {
  interface Request {
    queryParams: TFindInput;
  }
}

app.use(cors({
  origin: "*"
}));
//app.use(cookieParser());


// Middleware to parse JSON
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use("/api/v1", routes);
app.use("/webhook", webhookRoutes);

app.use((req: Request, res: Response, next: NextFunction) => {
  console.log("Incoming Request:", {
    method: req.method,
    url: req.url,
    headers: req.headers,
    query: req.query,
    // Note: The body might be empty if not yet parsed
    body: req.body,
  });
  next();
});

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
console.log(listEndpoints(app));

// Start the server using httpServer instead of app.listen
const PORT =  3005;
httpServer.listen(PORT, '0.0.0.0',() => {
  console.log(`HTTP & WebSocket Server running on http://localhost:${PORT}`);
});