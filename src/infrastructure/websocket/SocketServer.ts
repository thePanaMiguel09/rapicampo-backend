import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";

export class SocketServer {
    private io: Server;
    private userSockets: Map<string, string> = new Map();

    constructor(httpServer: HttpServer) {
        this.io = new Server(httpServer, {
            cors: {
                origin: process.env.FRONTEND_URL || 'http://localhost:5173',
                methods: ['GET', 'POST'],
                credentials: true
            }
        });
        this.setupEventHandlers();
    }

    private setupEventHandlers(): void {
        this.io.on('connection', (socket: Socket) => {
            console.log(`🔌 Cliente conectado: ${socket.id}`);

            socket.on('authenticate', (userId: string) => {
                this.userSockets.set(userId, socket.id);
                console.log(`✅ Usuario autenticado: ${userId} -> ${socket.id}`);
            });

            socket.on('disconnect', () => {
                for (const [userId, socketId] of this.userSockets.entries()) {
                    if (socketId === socket.id) {
                        this.userSockets.delete(userId);
                        console.log(`❌ Usuario desconectado: ${userId}`);
                        break;
                    }
                }
            });
        });
    }

    public notifyUser(userId: string, event: string, data: any): void {
        const socketId = this.userSockets.get(userId);
        if (socketId) {
            this.io.to(socketId).emit(event, data);
            console.log(`Notificación enviada a ${userId}: ${event}`);
        } else {
            console.log(`Usuario ${userId} no está conectado`);
        }
    }

    public broadcast(event: string, data: any): void {
        this.io.emit(event, data);
    }

    public getIO(): Server {
        return this.io;
    }

}