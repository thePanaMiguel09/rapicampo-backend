import { IServiceRepository } from "../../../domain/ports/IServiceRepository";
import { NotFoundError, ValidationError } from "../../../domain/errors";

export class AcceptServiceUseCase {
    constructor(private readonly serviceRepository: IServiceRepository){}

    async execute(serviceId: string, acceptingUserId: string): Promise<void> {
        const service = await this.serviceRepository.findServiceById(serviceId);

        if (!service) {
            throw new NotFoundError('Servicio', serviceId);
        }

        if (acceptingUserId === service.requesterUserId) {
            throw new ValidationError('No puede aceptar tu propio servicio',
                {servicio: ['No puedes aceptar tu propio servicio']}
            )
        }

        
    }
}