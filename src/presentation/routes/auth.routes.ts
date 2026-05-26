import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { AuthRepository } from '../../infrastructure/repositories/auth.repository';
import { JwtService } from '../../infrastructure/services/JwtService';
import { RegisterUserUseCase } from '../../application/use-cases/auth/RegisterUserUseCase';
import { LoginUserUseCase } from '../../application/use-cases/auth/LoginUserUseCase';
import { RefreshTokenUseCase } from '../../application/use-cases/auth/RefreshTokenUseCase';
import { LogoutUseCase } from '../../application/use-cases/auth/LogoutUseCase';

export const createAuthRouter = (jwtService: JwtService): Router => {
    const router = Router();

    const authRepository = new AuthRepository();

    const registerUseCase      = new RegisterUserUseCase(authRepository, jwtService);
    const loginUseCase         = new LoginUserUseCase(authRepository, jwtService);
    const refreshTokenUseCase  = new RefreshTokenUseCase(authRepository, jwtService);
    const logoutUseCase        = new LogoutUseCase(authRepository, jwtService);

    const controller = new AuthController(registerUseCase, loginUseCase, refreshTokenUseCase, logoutUseCase);

    router.post('/register', (req, res, next) => controller.register(req, res, next));
    router.post('/login',    (req, res, next) => controller.login(req, res, next));
    router.post('/refresh',  (req, res, next) => controller.refresh(req, res, next));
    router.post('/logout',   (req, res, next) => controller.logout(req, res, next));

    return router;
};
