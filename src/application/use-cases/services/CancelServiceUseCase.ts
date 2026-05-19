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

        if (service.requesterUserId !== requestingUserId) {
            throw new ForbiddenError('Solo el solicitante puede cancelar este servicio');
        }

        const cancelled = await this.serviceRepository.cancelService(serviceId, requestingUserId);

        // Si había un aceptante, notificarle la cancelación
        const aceptanteId = (service as unknown as Record<string, unknown>).id_usuario_aceptante as string | undefined;
        if (aceptanteId) {
            const notification = new Notification(
                aceptanteId,
                NotificationType.SERVICE_CANCELLED,
                'Servicio cancelado',
                'El solicitante ha cancelado el servicio que habías aceptado.',
                serviceId,
            );
            await this.notificationService.sendNotification(notification);
        }

        return cancelled;
    }
}