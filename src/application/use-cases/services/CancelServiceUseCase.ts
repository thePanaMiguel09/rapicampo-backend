import { Service } from "../../../domain/entities/Service";
import { Notification } from "../../../domain/entities/Notification";
import { NotificationType } from "../../../domain/enums/notification-type-enum";
import { NotFoundError, ForbiddenError } from "../../../domain/errors";
import { INotificationService } from "../../../domain/ports/INotificationService";
import { IServiceRepository } from "../../../domain/ports/IServiceRepository";

export class CancelServiceUseCase {
    constructor(
        private readonly serviceRepository: IServiceRepository,
        private readonly notificationService: INotificationService,
    ) { }

    async execute(serviceId: string, requestingUserId: string): Promise<Service> {
        const service = await this.serviceRepository.findServiceById(serviceId);

        if (!service) {
            throw new NotFoundError('Servicio', serviceId);
        }

        const isRequester = service.requesterUserId === requestingUserId;
        const isAcceptor  = service.acceptorUserId  === requestingUserId;

        if (!isRequester && !isAcceptor) {
            throw new ForbiddenError('Solo el solicitante o el realizador pueden cancelar este servicio');
        }

        const cancelled = await this.serviceRepository.cancelService(serviceId, requestingUserId);

        // Notificar a la otra parte
        const recipientId = isAcceptor ? service.requesterUserId : service.acceptorUserId;
        if (recipientId) {
            const actorLabel = isAcceptor ? 'El realizador' : 'El solicitante';
            const notification = new Notification(
                recipientId,
                NotificationType.SERVICIO_CANCELADO,
                'Servicio cancelado',
                `${actorLabel} ha cancelado el servicio.`,
                serviceId,
            );
            await this.notificationService.sendNotification(notification);
        }

        return cancelled;
    }
}
