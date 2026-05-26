import { UserRole } from '../../domain/enums/rol-enum';

export interface RegisterDTO {
    email: string;
    nombre: string;
    apellido: string;
    telefono?: string;
    password: string;
}

export interface LoginDTO {
    email: string;
    password: string;
}

export interface AuthResponseDTO {
    accessToken: string;
    refreshToken: string;
    user: {
        id: string;
        email: string;
        nombre: string;
        apellido: string;
        telefono: string | null;
        role: UserRole;
        emailVerified: boolean;
    };
}

export interface RefreshResponseDTO {
    accessToken: string;
    refreshToken: string;
}
