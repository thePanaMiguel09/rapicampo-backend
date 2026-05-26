import { UserRole } from "../enums/rol-enum";

export class User {
    constructor(
        public readonly id: string,
        public email: string,
        public nombre: string,
        public apellido: string,
        public readonly role: UserRole,
        public telefono: string | null,
        public passwordHash: string,
        public emailVerified: boolean,
        public isActive: boolean,
        public readonly createdAt: Date,
        public updatedAt: Date | null,
        public deletedAt: Date | null,
    ) {}
}