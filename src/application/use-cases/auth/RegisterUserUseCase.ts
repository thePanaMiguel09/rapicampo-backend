import bcrypt from 'bcryptjs';
import { IAuthRepository } from '../../../domain/ports/IAuthRepository';
import { IJwtService } from '../../../domain/ports/IJwtService';
import { ValidationError } from '../../../domain/errors';
import { RegisterDTO, AuthResponseDTO } from '../../dtos/AuthDTO';

const SALT_ROUNDS = 12;
const MIN_PASSWORD_LENGTH = 8;

export class RegisterUserUseCase {
    constructor(
        private readonly authRepository: IAuthRepository,
        private readonly jwtService: IJwtService,
    ) {}

    async execute(dto: RegisterDTO): Promise<AuthResponseDTO> {
        if (!dto.email || !dto.nombre || !dto.apellido || !dto.password) {
            throw new ValidationError('email, nombre, apellido y password son requeridos');
        }

        if (dto.password.length < MIN_PASSWORD_LENGTH) {
            throw new ValidationError(`La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`);
        }

        const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);

        const user = await this.authRepository.createUser({
            email: dto.email,
            nombre: dto.nombre,
            apellido: dto.apellido,
            telefono: dto.telefono ?? null,
            passwordHash,
        });

        const role = await this.authRepository.findRoleByName('USUARIO');
        if (role) {
            await this.authRepository.assignRoleToUser(user.id, role.id);
        }

        const payload = this.jwtService.userToPayload(user);
        const accessToken = this.jwtService.signAccessToken(payload);
        const refreshToken = this.jwtService.signRefreshToken(payload);

        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await this.authRepository.saveRefreshToken(user.id, this.jwtService.hashToken(refreshToken), expiresAt);

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
