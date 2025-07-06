import "reflect-metadata";
import express from "express";
import { createServer } from "http";
import { container } from "./config/container";
import WebSocketService from "./services/websocket.service";
import cors from "cors";
import routes from "./routes";
import bodyParser from "body-parser";

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  
  // Configure CORS
  app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  }));

  // Get WebSocket service instance
  const webSocketService = container.resolve(WebSocketService);
  
  // Initialize WebSocket with HTTP server
  webSocketService.initialize(httpServer);

  // Middleware
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  // Routes
  app.use('/api', routes);

  // Start server
  const PORT = process.env.PORT || 4000; // Changed to 4000
  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`WebSocket server available at ws://localhost:${PORT}`);
  });
}

startServer().catch(console.error);
