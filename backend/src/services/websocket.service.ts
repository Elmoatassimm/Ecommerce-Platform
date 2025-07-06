import { Server } from 'socket.io';
import { injectable } from 'tsyringe';
import { Server as HTTPServer } from 'http';

@injectable()
export default class WebSocketService {
  private io: Server | null = null;

  initialize(server: HTTPServer) {
    if (this.io) {
      console.log('WebSocket server already initialized');
      return;
    }

    this.io = new Server(server, {
      cors: {
        origin: ["http://localhost:5173"], // frontend URLs
        methods: ["GET", "POST"],
        credentials: true,
        allowedHeaders: ["my-custom-header"],
      },
      transports: ['websocket', 'polling'], // Enable both WebSocket and polling
      pingTimeout: 60000,
      pingInterval: 25000,
    });

    this.io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);
      
      // Add debug logging
      /*const welcomeData = {
        type: 'welcome',
        message: 'Welcome to our platform! You are now connected.',
        timestamp: new Date().toISOString()
      };*/
      
      //console.log('Sending welcome notification:', welcomeData);
      
      // Emit welcome notification
      //socket.emit('welcome', welcomeData);
      
      // Also emit as general notification
      //socket.emit('notification', welcomeData);

      socket.on('joinStoreRoom', (storeId: string) => {
        const room = `store_${storeId}`;
        socket.join(room);
        console.log(`Client ${socket.id} joined room: ${room}`);
        
        // Send room joined notification
        /*const roomData = {
          room, 
          message: 'Successfully joined room',
          timestamp: new Date().toISOString()
        };*/
        //console.log('Sending room joined notification:', roomData);
        //socket.emit('roomJoined', roomData);
      });

      // Add acknowledgment handler
      socket.on('notificationReceived', (data) => {
        console.log('Client acknowledged notification:', data);
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });

    console.log('WebSocket server initialized successfully');
  }

  notifyNewOrder(storeId: string, orderData: any) {
    if (!this.io) {
      console.error('WebSocket server not initialized');
      return;
    }

    try {
      const room = `store_${storeId}`;
      
      // Log room information
      const roomClients = this.io.sockets.adapter.rooms.get(room);
      const clientCount = roomClients ? roomClients.size : 0;
      
      console.log(`Attempting to send notification to room ${room} (${clientCount} clients connected)`);
      
      // Send only one notification with all necessary data
      const notification = {
        type: 'newOrder',
        message: `New order received: #${orderData.data.id}`,
        data: orderData.data,
        timestamp: new Date().toISOString()
      };

      console.log('Sending notification:', notification);
      this.io.to(room).emit('notification', notification);
      
      console.log(`Notification sent successfully to room ${room}`);
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  // Helper method to check if WebSocket server is initialized
  isInitialized(): boolean {
    return this.io !== null;
  }
}
