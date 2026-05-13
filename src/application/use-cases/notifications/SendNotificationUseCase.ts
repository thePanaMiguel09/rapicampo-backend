import { Notification } from "../../../domain/entities/Notification";
import { SocketServer } from "../../../infrastructure/websocket/SocketServer";

export class SendNotificationUseCase {
    constructor(private readonly socketServer: SocketServer){}

    execute(notification: Notification) {
        this.socketServer.notifyUser(
            notification.recipientUserId,
            'notification',
            {
                id: notification.id,
                type: notification.type,
                title: notification.title,
                serviceId: notification.serviceId,
                createdAt: notification.createdAt
            }
        );
    }
}