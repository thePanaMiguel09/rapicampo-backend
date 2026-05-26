import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { IAuthService } from '../../domain/ports/IAuthService';
import { IJwtService, JwtPayload } from '../../domain/ports/IJwtService';
import { User } from '../../domain/entities/User';
import { UserRole } from '../../domain/enums/rol-enum';
import { UnauthorizedError } from '../../domain/errors';

export class JwtService implements IAuthService, IJwtService {
    constructor(
        private readonly accessSecret: string,
        private readonly refreshSecret: string,
        private readonly accessExpiresIn: string = '15m',
        private readonly refreshExpiresIn: string = '7d',
    ) {}

    signAccessToken(payload: JwtPayload): string {
        return jwt.sign(payload, this.accessSecret, { expiresIn: this.accessExpiresIn as jwt.SignOptions['expiresIn'] });
    }

    signRefreshToken(payload: JwtPayload): string {
        return jwt.sign(payload, this.refreshSecret, { expiresIn: this.refreshExpiresIn as jwt.SignOptions['expiresIn'] });
    }

    verifyAccessToken(token: string): JwtPayload {
        try {
            return jwt.verify(token, this.accessSecret) as JwtPayload;
        } catch {
            throw new UnauthorizedError('Token de acceso inválido o expirado');
        }
    }

    verifyRefreshToken(token: string): JwtPayload {
        try {
            return jwt.verify(token, this.refreshSecret) as JwtPayload;
        } catch {
            throw new UnauthorizedError('Refresh token inválido o expirado');
        }
    }

    hashToken(token: string): string {
        return crypto.createHash('sha256').update(token).digest('hex');
    }

    userToPayload(user: User): JwtPayload {
        return {
            sub: user.id,
            email: user.email,
            nombre: user.nombre,
            apellido: user.apellido,
            role: user.role,
            telefono: user.telefono,
        };
    }

    // Implementación de IAuthService: valida el access token y retorna un User
    async validateUser(token: string): Promise<User> {
        const payload = this.verifyAccessToken(token);
        return new User(
            payload.sub,
            payload.email,
            payload.nombre,
            payload.apellido,
            payload.role as UserRole,
            payload.telefono,
            '',     // passwordHash no se almacena en el token
            true,
            true,
            new Date(),
            null,
            null,
        );
    }
}
