import { AxiosInstance } from "axios";
import { IAuthService } from "../../domain/ports/IAuthService";
import { User } from "../../domain/entities/User";

export class AuthServiceClient implements IAuthService {
    constructor(private readonly httpClient: AxiosInstance) { }

    async validateUser(token: string): Promise<User> {
        try {
            const response = await this.httpClient.post('/auth/me',
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    }
                }
            );

            return {
                id: response.data.id,
                nombre: response.data.nombre,
                role: response.data.rol,
                telefono: response.data.telefono,
                modulo: response.data.modulo ?? null,
                creado_en: new Date(response.data.creado_en)
            }

        } catch (error: any) {
            if (error.response?.status === 401) {
                throw new Error('Token inválido o expirado');
            }
            throw new Error('Error al validar token con Auth Service');
        }
    }
};


