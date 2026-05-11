export interface UsuarioDTO {
    id: string;
    nombre: string;
    telefono: string;
    rol: string;
}

export interface UserValidationDTO {
    valido: boolean;
    usuario?: UsuarioDTO;
    mensaje?: string;
}