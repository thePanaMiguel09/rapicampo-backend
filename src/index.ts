import express from 'express'
import { Request, Response } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { createAuthServiceClient } from './infrastructure/api/axios.config';
import { AuthServiceClient } from './infrastructure/http/AuthServiceClient';
import { ValidateUserUseCase } from './application/use-cases/auth/ValidateUserUseCase';
import { createAuthMiddleware } from './presentation/middleware/authMiddleware';
import { ServiceController } from './presentation/controllers/ServiceController';
import { CreateServiceUseCase } from './application/use-cases/services/CreateServiceUseCase';

dotenv.config();

const app = express();
const PORT: number = parseInt(process.env.PORT || '3000', 10);

app.use(cors());
app.use(express.json());

const httpCliente = createAuthServiceClient();
const authServiceClient = new AuthServiceClient(httpCliente);

const validateUserUseCase = new ValidateUserUseCase(authServiceClient);

const authMiddleware = createAuthMiddleware(validateUserUseCase);

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'OK' });
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto http://localhost:${PORT}`);
})