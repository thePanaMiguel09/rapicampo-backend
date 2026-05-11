import { Service } from "../../../domain/entities/Service";
import { NotFoundError } from "../../../domain/errors";
import { IServiceRepository } from "../../../domain/ports/IServiceRepository";

export class FindServiceUseCase {
    constructor(private readonly serviceRepository: IServiceRepository) { };

    async execute(id: string): Promise<Service | null> {
        const service = await this.serviceRepository.findServiceById(id);

        if (!service) {
            throw new NotFoundError('Servicio', id);
        }
        return service;
    }
}