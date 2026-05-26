import { IAuthRepository } from '../../../domain/ports/IAuthRepository';
import { IJwtService } from '../../../domain/ports/IJwtService';

export class LogoutUseCase {
    constructor(
        private readonly authRepository: IAuthRepository,
        private readonly jwtService: IJwtService,
    ) {}

    async execute(refreshToken: string): Promise<void> {
        const tokenHash = this.jwtService.hashToken(refreshToken);
        await this.authRepository.revokeRefreshToken(tokenHash);
    }
}
