import { AppError } from './AppError';

export class ForbiddenError extends AppError {
    constructor(message: string = 'No tienes permisos para realizar esta acción') {
        super(message, 403);
        Object.setPrototypeOf(this, ForbiddenError.prototype);
    }
}