import { ServiceState } from "../../../domain/enums/service-state-enum";
import { IServiceRepository } from "../../../domain/ports/IServiceRepository";
import { INotificationService } from "../../../domain/ports/INotificationService";
import { NotFoundError, ValidationError } from "../../../domain/errors";

export class AcceptServiceUseCase {
    constructor(
        private readonly serviceRepository: IServiceRepository,
        private readonly notificationService: INotificationService
    ) { }

    async execute(serviceId: string, acceptingUserId: string, acceptingUserName: string): Promise<void> {
        const service = await this.serviceRepository.findServiceById(serviceId);

        if (!service) {
            throw new NotFoundError('Servicio', serviceId);
        }

        if (acceptingUserId === service.requesterUserId) {
            throw new ValidationError('No puede aceptar tu propio servicio',
                { servicio: ['No puedes aceptar tu propio servicio'] }
            )
        }

        await this.serviceRepository.updateService(serviceId, {
            serviceState: ServiceState.EN_PROCESO
        });

        await this.notificationService.notifyServiceAccepted(
            serviceId,
            service.requesterUserId,
            acceptingUserName
        )

    }
}