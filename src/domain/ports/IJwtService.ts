import { User } from '../entities/User';

export interface JwtPayload {
    sub: string;
    email: string;
    nombre: string;
    apellido: string;
    role: string;
    telefono: string | null;
}

export interface IJwtService {
    signAccessToken(payload: JwtPayload): string;
    signRefreshToken(payload: JwtPayload): string;
    verifyAccessToken(token: string): JwtPayload;
    verifyRefreshToken(token: string): JwtPayload;
    hashToken(token: string): string;
    userToPayload(user: User): JwtPayload;
}
