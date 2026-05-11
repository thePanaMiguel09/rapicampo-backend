import { AppError } from './AppError';

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    const message = id 
      ? `${resource} con ID ${id} no encontrado`
      : `${resource} no encontrado`;
    
    super(message, 404);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}