import { INotificationService } from "../../domain/ports/INotificationService";
import { Notification } from "../../domain/entities/Notification";
import { INotificationRepository } from "../../domain/ports/INotificationRepository";
import { SocketServer } from "../websocket/SocketServer";
import { NotificationType } from "../../domain/enums/notification-type-enum";

export class NotificationService implements INotificationService {
    constructor(
        private readonly notificationRepository: INotificationRepository,
        private readonly socketServer: SocketServer
    ) { }

    async sendNotification(notification: Notification): Promise<void> {
        const savedNotification = await this.notificationRepository.create(notification);

        this.socketServer.notifyUser(
            notification.recipientUserId,
            'new_notification',
            savedNotification
        );
    }


    async notifyServiceAccepted(serviceId: string, recipientUserId: string, acceptingUserName: string): Promise<void> {
        const notification = new Notification(
            recipientUserId,
            NotificationType.SERVICIO_ACEPTADO,
            '¡Tu servicio fue aceptado!',
            `${acceptingUserName} ha aceptado tu servicio`,
            serviceId
        );

        await this.sendNotification(notification);
    }


}