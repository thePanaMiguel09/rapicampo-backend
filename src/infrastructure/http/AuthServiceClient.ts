import { AxiosInstance } from "axios";
import { IAuthService } from "../../domain/ports/IAuthService";
import { User } from "../../domain/entities/User";

export class AuthServiceClient implements IAuthService {
    constructor(private readonly httpClient: AxiosInstance) { }

    async validateUser(token: string): Promise<User> {
        try {
            const response = await this.httpClient.get('/auth/me',
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    }
                }
            );

            return new User(
                response.data.id,
                response.data.email,
                response.data.nombre,
                response.data.apellido,
                response.data.rol,
                response.data.telefono ?? null,
                '',
                true,
                true,
                new Date(),
                null,
                null,
            )

        } catch (error: any) {
            if (error.response?.status === 401) {
                throw new Error('Token inválido o expirado');
            }
            throw new Error('Error al validar token con Auth Service');
        }
    }
};


