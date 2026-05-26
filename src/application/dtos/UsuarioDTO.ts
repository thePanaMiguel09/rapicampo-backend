export interface UsuarioDTO {
    id: string;
    email: string;
    nombre: string;
    apellido: string;
    telefono: string | null;
    rol: string;
}

export interface UserValidationDTO {
    valido: boolean;
    usuario?: UsuarioDTO;
    mensaje?: string;
}