import express from 'express';
import cors from 'cors';
import { config } from './infrastructure/config/env';
import { createAuthServiceClient } from './infrastructure/api/axios.config';
import { AuthServiceClient } from './infrastructure/http/AuthServiceClient';
import { ValidateUserUseCase } from './application/use-cases/auth/ValidateUserUseCase';
import { createAuthMiddleware } from './presentation/middleware/authMiddleware';
import { createServiceRouter } from './presentation/routes/services.routes';
import { errorHandler, notFoundHandler } from './presentation/middleware/errorHandler';
import dotenv from 'dotenv'
dotenv.config();

const app = express();
const PORT: number = parseInt(process.env.PORT || '4000', 10);

app.use(cors());
app.use(express.json());

const httpCliente = createAuthServiceClient();
const authServiceClient = new AuthServiceClient(httpCliente);
const validateUserUseCase = new ValidateUserUseCase(authServiceClient);
const authMiddleware = createAuthMiddleware(validateUserUseCase);


app.get('/health', (_req, res) => {
  res.json({ status: 'OK' });
});

app.use('/api/services', createServiceRouter(authMiddleware));

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(config.PORT, () => {
  console.log(`Servidor escuchando en el puerto http://localhost:${PORT}`);
})