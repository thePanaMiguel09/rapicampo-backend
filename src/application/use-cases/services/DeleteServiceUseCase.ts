import { IServiceRepository } from '../../../domain/ports/IServiceRepository';
import { NotFoundError, ForbiddenError } from '../../../domain/errors';

export class DeleteServiceUseCase {
    constructor(private readonly serviceRepository: IServiceRepository) { }

    async execute(serviceId: string, requestingUserId: string): Promise<void> {
        const service = await this.serviceRepository.findServiceById(serviceId);

        if (!service) {
            throw new NotFoundError('Servicio', serviceId);
        }

        if (service.requesterUserId !== requestingUserId) {
            throw new ForbiddenError('Solo el solicitante puede eliminar este servicio');
        }

        // softDeleteService valida internamente que el estado lo permita
        await this.serviceRepository.softDeleteService(serviceId, requestingUserId);
    }
}