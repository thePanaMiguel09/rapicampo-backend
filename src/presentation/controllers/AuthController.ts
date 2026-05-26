import { Request, Response, NextFunction } from 'express';
import { RegisterUserUseCase } from '../../application/use-cases/auth/RegisterUserUseCase';
import { LoginUserUseCase } from '../../application/use-cases/auth/LoginUserUseCase';
import { RefreshTokenUseCase } from '../../application/use-cases/auth/RefreshTokenUseCase';
import { LogoutUseCase } from '../../application/use-cases/auth/LogoutUseCase';
import { successResponse } from '../interfaces/ApiResponse';
import { ValidationError } from '../../domain/errors';

export class AuthController {
    constructor(
        private readonly registerUseCase: RegisterUserUseCase,
        private readonly loginUseCase: LoginUserUseCase,
        private readonly refreshTokenUseCase: RefreshTokenUseCase,
        private readonly logoutUseCase: LogoutUseCase,
    ) {}

    async register(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await this.registerUseCase.execute(req.body);
            res.status(201).json(successResponse(result));
        } catch (error) {
            next(error);
        }
    }

    async login(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userAgent = req.headers['user-agent'];
            const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim()
                ?? req.socket.remoteAddress;
            const result = await this.loginUseCase.execute(req.body, userAgent, ip);
            res.status(200).json(successResponse(result));
        } catch (error) {
            next(error);
        }
    }

    async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { refreshToken } = req.body;
            if (!refreshToken) {
                throw new ValidationError('refreshToken es requerido');
            }
            const result = await this.refreshTokenUseCase.execute(refreshToken);
            res.status(200).json(successResponse(result));
        } catch (error) {
            next(error);
        }
    }

    async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { refreshToken } = req.body;
            if (!refreshToken) {
                throw new ValidationError('refreshToken es requerido');
            }
            await this.logoutUseCase.execute(refreshToken);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
}
