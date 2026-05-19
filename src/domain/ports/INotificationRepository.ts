import { Notification } from '../entities/Notification';

export interface INotificationRepository {
    create(notification: Notification): Promise<Notification>;
    findByUserId(
        userId: string,
        options?: { onlyUnread?: boolean; limit?: number; offset?: number }
    ): Promise<Notification[]>;
    findByServiceId(serviceId: string, userId: string): Promise<Notification[]>;
    countUnread(userId: string): Promise<number>;
    markAsRead(notificationId: string, userId: string): Promise<void>;
    markAllAsRead(userId: string): Promise<number>;
    deleteOldReadNotifications(olderThanDays: number): Promise<number>;
}