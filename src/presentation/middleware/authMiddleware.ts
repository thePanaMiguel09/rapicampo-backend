import { Request, Response, NextFunction } from "express";
import { ValidateUserUseCase } from "../../application/use-cases/auth/ValidateUserUseCase";
import { UnauthorizedError } from "../../domain/errors";

declare global {
    namespace Express {
        interface Request {
            usuario?: {
                id: string;
                email: string;
                nombre: string;
                apellido: string;
                telefono: string | null;
                rol: string;
            };
        }
    }
}

export const createAuthMiddleware = (validateUserUseCase: ValidateUserUseCase) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authHeader = req.headers.authorization;

            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                throw new UnauthorizedError('Token no proporcionado');
            }

            const token = authHeader.substring(7);

            const userValidation = await validateUserUseCase.execute(token);

            if (!userValidation.valido) {
                return res.status(401).json({
                    error: userValidation.mensaje || 'Token inválido'
                })
            }

            req.usuario = userValidation.usuario!;

            next();

        } catch (error) {
            console.error('[AuthMiddleware] Error:', error);
            next(error);
        }
    }
}