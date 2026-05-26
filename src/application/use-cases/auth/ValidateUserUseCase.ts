import { IAuthService } from "../../../domain/ports/IAuthService";
import { UserValidationDTO } from "../../dtos/UsuarioDTO";

export class ValidateUserUseCase {
    constructor(private readonly authService: IAuthService) { }

    async execute(token: string): Promise<UserValidationDTO> {
        try {
            const user = await this.authService.validateUser(token);

            if (!user) {
                return {
                    valido: false,
                    mensaje: 'Usuario no autenticado.'
                }
            }

            return {
                    valido: true,
                    usuario: {
                        id: user.id,
                        email: user.email,
                        nombre: user.nombre,
                        apellido: user.apellido,
                        rol: user.role,
                        telefono: user.telefono,
                    }
                }

        } catch (error: any) {
            return {
                valido: false,
                mensaje: error.message || 'Error al validar usuario'
            };
        }
    }
}
