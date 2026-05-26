import { IAuthRepository, CreateUserData, RefreshTokenRecord } from '../../domain/ports/IAuthRepository';
import { User } from '../../domain/entities/User';
import { UserRole } from '../../domain/enums/rol-enum';
import { AppError } from '../../domain/errors';
import connection from '../database/connection';

function mapRowToUser(row: Record<string, unknown>): User {
    return new User(
        row.pk_id_usuario as string,
        row.email as string,
        row.nombre as string,
        row.apellido as string,
        (row.nombre_rol ?? UserRole.USUARIO) as UserRole,
        (row.telefono as string) ?? null,
        row.hash_contrasena as string,
        row.email_verificado as boolean,
        row.activo as boolean,
        row.fecha_creacion as Date,
        (row.fecha_actualizacion as Date) ?? null,
        (row.eliminado_en as Date) ?? null,
    );
}

export class AuthRepository implements IAuthRepository {

    async createUser(data: CreateUserData): Promise<User> {
        const query = `
            INSERT INTO auth.usuarios (email, nombre, apellido, telefono, hash_contrasena)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        try {
            const { rows } = await connection.query(query, [
                data.email.toLowerCase(),
                data.nombre,
                data.apellido,
                data.telefono ?? null,
                data.passwordHash,
            ]);
            const row = rows[0];
            return new User(
                row.pk_id_usuario,
                row.email,
                row.nombre,
                row.apellido,
                UserRole.USUARIO,
                row.telefono ?? null,
                row.hash_contrasena,
                row.email_verificado,
                row.activo,
                row.fecha_creacion,
                row.fecha_actualizacion ?? null,
                row.eliminado_en ?? null,
            );
        } catch (error: any) {
            if (error.code === '23505') {
                throw new AppError('El correo electrónico ya está registrado', 409);
            }
            console.error('[AuthRepository.createUser]', error);
            throw new AppError('Error al crear usuario', 500);
        }
    }

    async findUserByEmail(email: string): Promise<User | null> {
        const query = `
            SELECT u.*, r.nombre AS nombre_rol
            FROM auth.usuarios u
            LEFT JOIN auth.usuario_roles ur ON ur.fk_id_usuario = u.pk_id_usuario
            LEFT JOIN auth.roles r          ON r.pk_id_rol      = ur.fk_id_rol
            WHERE u.email        = $1
              AND u.eliminado_en IS NULL
            LIMIT 1
        `;
        try {
            const { rows } = await connection.query(query, [email.toLowerCase()]);
            return rows.length ? mapRowToUser(rows[0]) : null;
        } catch (error) {
            console.error('[AuthRepository.findUserByEmail]', error);
            throw new AppError('Error al buscar usuario', 500);
        }
    }

    async findUserById(id: string): Promise<User | null> {
        const query = `
            SELECT u.*, r.nombre AS nombre_rol
            FROM auth.usuarios u
            LEFT JOIN auth.usuario_roles ur ON ur.fk_id_usuario = u.pk_id_usuario
            LEFT JOIN auth.roles r          ON r.pk_id_rol      = ur.fk_id_rol
            WHERE u.pk_id_usuario = $1
              AND u.eliminado_en  IS NULL
            LIMIT 1
        `;
        try {
            const { rows } = await connection.query(query, [id]);
            return rows.length ? mapRowToUser(rows[0]) : null;
        } catch (error) {
            console.error('[AuthRepository.findUserById]', error);
            throw new AppError('Error al buscar usuario', 500);
        }
    }

    async findRoleByName(name: string): Promise<{ id: string; nombre: string } | null> {
        const { rows } = await connection.query(
            'SELECT pk_id_rol AS id, nombre FROM auth.roles WHERE nombre = $1',
            [name],
        );
        return rows.length ? { id: rows[0].id as string, nombre: rows[0].nombre as string } : null;
    }

    async assignRoleToUser(userId: string, roleId: string): Promise<void> {
        await connection.query(
            `INSERT INTO auth.usuario_roles (fk_id_usuario, fk_id_rol)
             VALUES ($1, $2)
             ON CONFLICT DO NOTHING`,
            [userId, roleId],
        );
    }

    async saveRefreshToken(
        userId: string,
        tokenHash: string,
        expiresAt: Date,
        userAgent?: string,
        ipAddress?: string,
    ): Promise<void> {
        await connection.query(
            `INSERT INTO auth.refresh_tokens (fk_id_usuario, token_hash, expires_at, user_agent, ip_address)
             VALUES ($1, $2, $3, $4, $5)`,
            [userId, tokenHash, expiresAt, userAgent ?? null, ipAddress ?? null],
        );
    }

    async findRefreshToken(tokenHash: string): Promise<RefreshTokenRecord | null> {
        const query = `
            SELECT
                pk_id_token       AS id,
                fk_id_usuario     AS "userId",
                token_hash        AS "tokenHash",
                expires_at        AS "expiresAt",
                revocado
            FROM auth.refresh_tokens
            WHERE token_hash = $1
              AND revocado   = FALSE
              AND expires_at > NOW()
        `;
        const { rows } = await connection.query(query, [tokenHash]);
        return rows.length ? (rows[0] as RefreshTokenRecord) : null;
    }

    async revokeRefreshToken(tokenHash: string): Promise<void> {
        await connection.query(
            'UPDATE auth.refresh_tokens SET revocado = TRUE WHERE token_hash = $1',
            [tokenHash],
        );
    }
}
