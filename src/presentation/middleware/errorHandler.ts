import { Request, Response, NextFunction } from "express";
import { AppError } from "../../domain/errors";
import { errorResponse } from "../interfaces/ApiResponse";

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (err instanceof AppError) {
        const response = errorResponse(
            err.message,
            'fields' in err ? (err as any).fields : undefined,
            req.path
        );

        return res.status(err.statusCode).json(response);
    }

    console.error('❌ Error no manejado:', err);

    const response = errorResponse(
        process.env.NODE_ENV === 'production'
            ? 'Error interno del servidor'
            : err.message,
        undefined,
        req.path
    );

    return res.status(500).json(response);

}

export const notFoundHandler = (req: Request, res: Response) => {
    const response = errorResponse(
        `Ruta ${req.method} ${req.path} no encontrada`,
        undefined,
        req.path
    );

    res.status(404).json(response);
};