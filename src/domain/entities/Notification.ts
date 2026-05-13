import { NotificationType } from "../enums/notification-type-enum";

export class Notification {
    constructor(
        public readonly recipientUserId: string,
        public readonly type: NotificationType,
        public readonly title: string,
        public readonly message: string,
        public readonly serviceId: string,
        public readonly createdAt: Date = new Date(),
        public readonly id?: string
    ){}
}