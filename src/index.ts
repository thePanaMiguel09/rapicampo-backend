import express from 'express';
import cors from 'cors';
import { config } from './infrastructure/config/env';
import { createAuthServiceClient } from './infrastructure/api/axios.config';
import { AuthServiceClient } from './infrastructure/http/AuthServiceClient';
import { ValidateUserUseCase } from './application/use-cases/auth/ValidateUserUseCase';
import { createAuthMiddleware } from './presentation/middleware/authMiddleware';
import { createServiceRouter } from './presentation/routes/services.routes';
import { createUserRouter } from './presentation/routes/users.routes';
import { errorHandler, notFoundHandler } from './presentation/middleware/errorHandler';
import dotenv from 'dotenv'
import { createServer } from 'http';
import { SocketServer } from './infrastructure/websocket/SocketServer';

dotenv.config();

const app = express();

const httpServer = createServer(app);

const socketServer = new SocketServer(httpServer);

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
})); app.use(express.json());



const httpCliente = createAuthServiceClient();
const authServiceClient = new AuthServiceClient(httpCliente);
const validateUserUseCase = new ValidateUserUseCase(authServiceClient);
const authMiddleware = createAuthMiddleware(validateUserUseCase);


app.get('/health', (_req, res) => {
  res.status(200).json({
    status: "ok",
    servicio: "rapicampo",
    version: "1.0.0"
  });
});

app.use('/api/services', createServiceRouter(authMiddleware, socketServer));
app.use('/api/users', createUserRouter(authMiddleware));

app.use(notFoundHandler);
app.use(errorHandler);

httpServer.listen(config.PORT, '0.0.0.0', () => {
  console.log(`Servidor Rapicampo listo en el puerto ${config.PORT}`);
  console.log(`WebSocket Server activo`);
});