import { Notification } from "../entities/Notification";

export interface INotificationService {
    sendNotification(notification: Notification): Promise<void>;
    notifyServiceAccepted(serviceId: string, recipientUserId: string, acceptingUserName: string): Promise<void>;
}