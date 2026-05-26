import { IAuthRepository } from '../../../domain/ports/IAuthRepository';
import { IJwtService } from '../../../domain/ports/IJwtService';
import { UnauthorizedError } from '../../../domain/errors';
import { RefreshResponseDTO } from '../../dtos/AuthDTO';

export class RefreshTokenUseCase {
    constructor(
        private readonly authRepository: IAuthRepository,
        private readonly jwtService: IJwtService,
    ) {}

    async execute(refreshToken: string): Promise<RefreshResponseDTO> {
        const payload = this.jwtService.verifyRefreshToken(refreshToken);

        const tokenHash = this.jwtService.hashToken(refreshToken);
        const tokenRecord = await this.authRepository.findRefreshToken(tokenHash);

        if (!tokenRecord) {
            throw new UnauthorizedError('Refresh token inválido o revocado');
        }

        const user = await this.authRepository.findUserById(payload.sub);
        if (!user || !user.isActive) {
            throw new UnauthorizedError('Usuario no encontrado o inactivo');
        }

        // Rotación: revocar el anterior, emitir uno nuevo
        await this.authRepository.revokeRefreshToken(tokenHash);

        const newPayload = this.jwtService.userToPayload(user);
        const newAccessToken = this.jwtService.signAccessToken(newPayload);
        const newRefreshToken = this.jwtService.signRefreshToken(newPayload);

        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await this.authRepository.saveRefreshToken(user.id, this.jwtService.hashToken(newRefreshToken), expiresAt);

        return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    }
}
