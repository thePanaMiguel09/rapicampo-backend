import { IServiceRepository } from '../../../domain/ports/IServiceRepository';
import { INotificationService } from '../../../domain/ports/INotificationService';
import { NotFoundError, ValidationError } from '../../../domain/errors';

export class AcceptServiceUseCase {
    constructor(
        private readonly serviceRepository: IServiceRepository,
        private readonly notificationService: INotificationService,
    ) {}

    async execute(
        serviceId: string,
        acceptingUserId: string,
        acceptingUserName: string,
    ): Promise<void> {
        // 1. Verificar que el servicio existe
        const service = await this.serviceRepository.findServiceById(serviceId);

        if (!service) {
            throw new NotFoundError('Servicio', serviceId);
        }

        // 2. Validar que el solicitante no se acepta a sí mismo
        if (acceptingUserId === service.requesterUserId) {
            throw new ValidationError('No puedes aceptar tu propio servicio', {
                servicio: ['El solicitante y el realizador no pueden ser el mismo usuario'],
            });
        }

        // 3. Ejecutar la aceptación en transacción
        //    - Actualiza estado del servicio a EN_PROCESO
        //    - Registra en aceptacion_servicios
        //    - Lanza ConflictError si ya fue tomado (race condition)
        await this.serviceRepository.acceptService(serviceId, acceptingUserId);

        // 4. Notificar al solicitante
        await this.notificationService.notifyServiceAccepted(
            serviceId,
            service.requesterUserId,
            acceptingUserName,
        );
    }
}