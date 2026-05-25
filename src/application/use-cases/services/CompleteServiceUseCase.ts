import { Service } from '../../../domain/entities/Service';
import { IServiceRepository } from '../../../domain/ports/IServiceRepository';
import { INotificationService } from '../../../domain/ports/INotificationService';
import { NotFoundError, ForbiddenError } from '../../../domain/errors';
import { NotificationType } from '../../../domain/enums/notification-type-enum';
import { Notification } from '../../../domain/entities/Notification';

export class CompleteServiceUseCase {
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
            throw new ForbiddenError('Solo el solicitante o el realizador pueden completar este servicio');
        }

        const completed = await this.serviceRepository.completeService(serviceId);

        // Notificar a la otra parte
        const recipientId = isAcceptor ? service.requesterUserId : service.acceptorUserId;
        if (recipientId) {
            const notification = new Notification(
                recipientId,
                NotificationType.SERVICE_COMPLETED,
                '¡Servicio completado!',
                'El servicio ha sido marcado como completado exitosamente.',
                serviceId,
            );
            await this.notificationService.sendNotification(notification);
        }

        return completed;
    }
}
