import { AppError } from './AppError';

export class ValidationError extends AppError {
  constructor(
    message: string,
    public readonly fields?: Record<string, string[]>
  ) {
    super(message, 400);
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}