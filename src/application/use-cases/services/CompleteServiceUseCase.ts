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

        // Solo el solicitante puede marcar como completado
        if (service.requesterUserId !== requestingUserId) {
            throw new ForbiddenError('Solo el solicitante puede completar este servicio');
        }

        const completed = await this.serviceRepository.completeService(serviceId);

        // Notificar al realizador si existe
        if (service.requesterUserId) {
            const notification = new Notification(
                service.requesterUserId,
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