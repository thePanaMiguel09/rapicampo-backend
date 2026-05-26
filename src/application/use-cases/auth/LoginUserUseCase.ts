import bcrypt from 'bcryptjs';
import { IAuthRepository } from '../../../domain/ports/IAuthRepository';
import { IJwtService } from '../../../domain/ports/IJwtService';
import { InvalidCredentialsError } from '../../../domain/errors';
import { LoginDTO, AuthResponseDTO } from '../../dtos/AuthDTO';

export class LoginUserUseCase {
    constructor(
        private readonly authRepository: IAuthRepository,
        private readonly jwtService: IJwtService,
    ) {}

    async execute(dto: LoginDTO, userAgent?: string, ipAddress?: string): Promise<AuthResponseDTO> {
        const user = await this.authRepository.findUserByEmail(dto.email);

        if (!user || !user.isActive) {
            throw new InvalidCredentialsError();
        }

        const passwordMatch = await bcrypt.compare(dto.password, user.passwordHash);
        if (!passwordMatch) {
            throw new InvalidCredentialsError();
        }

        const payload = this.jwtService.userToPayload(user);
        const accessToken = this.jwtService.signAccessToken(payload);
        const refreshToken = this.jwtService.signRefreshToken(payload);

        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await this.authRepository.saveRefreshToken(
            user.id,
            this.jwtService.hashToken(refreshToken),
            expiresAt,
            userAgent,
            ipAddress,
        );

        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                nombre: user.nombre,
                apellido: user.apellido,
                telefono: user.telefono,
                role: user.role,
                emailVerified: user.emailVerified,
            },
        };
    }
}
