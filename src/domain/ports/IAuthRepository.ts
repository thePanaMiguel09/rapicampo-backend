import { User } from '../entities/User';

export interface CreateUserData {
    email: string;
    nombre: string;
    apellido: string;
    telefono?: string | null;
    passwordHash: string;
}

export interface RefreshTokenRecord {
    id: string;
    userId: string;
    tokenHash: string;
    expiresAt: Date;
    revocado: boolean;
}

export interface IAuthRepository {
    createUser(data: CreateUserData): Promise<User>;
    findUserByEmail(email: string): Promise<User | null>;
    findUserById(id: string): Promise<User | null>;
    findRoleByName(name: string): Promise<{ id: string; nombre: string } | null>;
    assignRoleToUser(userId: string, roleId: string): Promise<void>;
    saveRefreshToken(userId: string, tokenHash: string, expiresAt: Date, userAgent?: string, ipAddress?: string): Promise<void>;
    findRefreshToken(tokenHash: string): Promise<RefreshTokenRecord | null>;
    revokeRefreshToken(tokenHash: string): Promise<void>;
}
