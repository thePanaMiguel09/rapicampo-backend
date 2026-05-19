import { INotificationRepository } from '../../domain/ports/INotificationRepository';
import { Notification } from '../../domain/entities/Notification';
import { NotificationType } from '../../domain/enums/notification-type-enum';
import { AppError } from '../../domain/errors';
import connection from '../database/connection';

// ============================================================================
// MAPEADOR
// ============================================================================

function mapRowToNotification(row: Record<string, unknown>): Notification {
    return new Notification(
        row.id_usuario_destinatario as string,
        row.tipo_notificacion as NotificationType,
        row.titulo as string,
        row.mensaje as string,
        row.id_servicio as string,
        row.fecha_creacion as Date,
        row.pk_id_notificacion as string,
    );
}

// ============================================================================
// NOTIFICATION REPOSITORY
// ============================================================================

export class NotificationRepository implements INotificationRepository {

    // ── CREATE ────────────────────────────────────────────────────────────────

    async create(notification: Notification): Promise<Notification> {
        const query = `
            INSERT INTO solicitudes.notificaciones (
                id_usuario_destinatario,
                tipo_notificacion,
                titulo,
                mensaje,
                id_servicio
            ) VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;

        const values = [
            notification.recipientUserId,
            notification.type,
            notification.title,
            notification.message,
            notification.serviceId,
        ];

        try {
            const { rows } = await connection.query(query, values);
            return mapRowToNotification(rows[0]);
        } catch (error) {
            console.error('[NotificationRepository.create]', error);
            throw new AppError('Error al crear la notificación', 500);
        }
    }

    // ── READ BY USER ──────────────────────────────────────────────────────────
    // Usa el índice compuesto idx_notificaciones_usuario_leida.
    // Parámetro `onlyUnread` permite filtrar solo no leídas (caso más común).

    async findByUserId(
        userId: string,
        options: { onlyUnread?: boolean; limit?: number; offset?: number } = {}
    ): Promise<Notification[]> {
        const { onlyUnread = false, limit = 50, offset = 0 } = options;

        const query = `
            SELECT
                pk_id_notificacion,
                id_usuario_destinatario,
                tipo_notificacion,
                titulo,
                mensaje,
                id_servicio,
                leida,
                leida_en,
                fecha_creacion
            FROM solicitudes.notificaciones
            WHERE id_usuario_destinatario = $1
              ${onlyUnread ? 'AND leida = FALSE' : ''}
            ORDER BY fecha_creacion DESC
            LIMIT $2 OFFSET $3
        `;

        try {
            const { rows } = await connection.query(query, [userId, limit, offset]);
            return rows.map(mapRowToNotification);
        } catch (error) {
            console.error('[NotificationRepository.findByUserId]', error);
            throw new AppError('Error al obtener notificaciones', 500);
        }
    }

    // ── COUNT UNREAD ──────────────────────────────────────────────────────────
    // Query ligera para badges de UI. No carga entidades completas.

    async countUnread(userId: string): Promise<number> {
        const query = `
            SELECT COUNT(*) AS total
            FROM solicitudes.notificaciones
            WHERE id_usuario_destinatario = $1
              AND leida = FALSE
        `;

        try {
            const { rows } = await connection.query(query, [userId]);
            return parseInt(rows[0].total, 10);
        } catch (error) {
            console.error('[NotificationRepository.countUnread]', error);
            throw new AppError('Error al contar notificaciones', 500);
        }
    }

    // ── MARK AS READ (individual) ─────────────────────────────────────────────
    // El trigger tr_marcar_leida_en auto-puebla leida_en al hacer SET leida=TRUE.
    // Solo marca si pertenece al userId correcto (seguridad multi-tenant).

    async markAsRead(notificationId: string, userId: string): Promise<void> {
        const query = `
            UPDATE solicitudes.notificaciones
            SET leida = TRUE
            WHERE pk_id_notificacion        = $1
              AND id_usuario_destinatario   = $2
              AND leida                     = FALSE
        `;

        try {
            await connection.query(query, [notificationId, userId]);
        } catch (error) {
            console.error('[NotificationRepository.markAsRead]', error);
            throw new AppError('Error al marcar la notificación como leída', 500);
        }
    }

    // ── MARK ALL AS READ ──────────────────────────────────────────────────────
    // Útil para el botón "Marcar todo como leído" en la UI.

    async markAllAsRead(userId: string): Promise<number> {
        const query = `
            UPDATE solicitudes.notificaciones
            SET leida = TRUE
            WHERE id_usuario_destinatario = $1
              AND leida = FALSE
            RETURNING pk_id_notificacion
        `;

        try {
            const { rowCount } = await connection.query(query, [userId]);
            return rowCount ?? 0;
        } catch (error) {
            console.error('[NotificationRepository.markAllAsRead]', error);
            throw new AppError('Error al marcar todas las notificaciones como leídas', 500);
        }
    }

    // ── FIND BY SERVICE ───────────────────────────────────────────────────────
    // Útil para mostrar historial de notificaciones asociadas a un servicio.

    async findByServiceId(serviceId: string, userId: string): Promise<Notification[]> {
        const query = `
            SELECT
                pk_id_notificacion,
                id_usuario_destinatario,
                tipo_notificacion,
                titulo,
                mensaje,
                id_servicio,
                leida,
                leida_en,
                fecha_creacion
            FROM solicitudes.notificaciones
            WHERE id_servicio               = $1
              AND id_usuario_destinatario   = $2
            ORDER BY fecha_creacion DESC
        `;

        try {
            const { rows } = await connection.query(query, [serviceId, userId]);
            return rows.map(mapRowToNotification);
        } catch (error) {
            console.error('[NotificationRepository.findByServiceId]', error);
            throw new AppError('Error al obtener notificaciones del servicio', 500);
        }
    }

    // ── DELETE OLD (mantenimiento) ────────────────────────────────────────────
    // Limpia notificaciones leídas más antiguas que N días.
    // Llamar desde un cron job, no desde endpoints de usuario.

    async deleteOldReadNotifications(olderThanDays: number): Promise<number> {
        const query = `
            DELETE FROM solicitudes.notificaciones
            WHERE leida = TRUE
              AND leida_en < NOW() - ($1 || ' days')::INTERVAL
            RETURNING pk_id_notificacion
        `;

        try {
            const { rowCount } = await connection.query(query, [olderThanDays]);
            return rowCount ?? 0;
        } catch (error) {
            console.error('[NotificationRepository.deleteOldReadNotifications]', error);
            throw new AppError('Error en limpieza de notificaciones', 500);
        }
    }
}