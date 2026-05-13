import { INotificationRepository } from "../../domain/ports/INotificationRepository";
import { Notification } from "../../domain/entities/Notification";
import { NotificationType } from "../../domain/enums/notification-type-enum";
import connection from "../database/connection";

export class NotificationRepository implements INotificationRepository {


    private mapRowToNotification(row: any) {
        return new Notification(
            row.id_usuario_destinatario,
            row.tipo_notificacion as NotificationType,
            row.titulo,
            row.mensaje,
            row.id_servicio,
            row.fecha_creacion,
            row.pk_id_notificacion
        )
    }

    async create(notification: Notification): Promise<Notification> {
        try {
            const query = `
                INSERT INTO solicitudes.notificaciones(
                    id_usuario_destinatario,
                    tipo_notificacion,
                    titulo,
                    mensaje,
                    id_servicio
                ) VALUES($1, $2, $3, $4, $5)
                RETURNING *
            `;

            const values = [
                notification.recipientUserId,
                notification.type,
                notification.title,
                notification.message,
                notification.serviceId
            ];

            const { rows } = await connection.query(query, values);
            return this.mapRowToNotification(rows[0]);
        } catch (error) {
            console.error(error);
            throw new Error('Error creating notification');
        }
    }

    async findByUserId(userId: string): Promise<Notification[]> {
        try {
            const query = `
                SELECT * FROM solicitudes.notificaciones
                WHERE id_usuario_destinatario = $1
                ORDER BY fecha_creacion DESC
            `;

            const { rows } = await connection.query(query, [userId]);
            return rows.map(row => this.mapRowToNotification(row));
        } catch (error) {
            console.error(error);
            throw new Error('Error fetching notifications');
        }
    }

    async markAsRead(notificationId: string): Promise<void> {
        try {
            const query = `
                UPDATE solicitudes.notificaciones
                SET leida = TRUE
                WHERE pk_id_notificacion = $1
            `;

            await connection.query(query, [notificationId]);
        } catch (error) {
            console.error(error);
            throw new Error('Error marking notification as read');
        }
    }
}
