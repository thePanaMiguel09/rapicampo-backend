import { UserRole } from "../enums/rol-enum";

export class User {
    constructor(
        public readonly id: string,
        public readonly role: UserRole,
        public nombre: string,
        public telefono: string,
        public modulo: string | null,
        public creado_en: Date
    ) { }

}