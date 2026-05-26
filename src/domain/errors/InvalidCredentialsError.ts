import { AppError } from './AppError';

export class InvalidCredentialsError extends AppError {
    constructor() {
        super('Credenciales inválidas', 401);
        Object.setPrototypeOf(this, InvalidCredentialsError.prototype);
    }
}
