import { Service } from "../../../domain/entities/Service";
import { PaymentType } from "../../../domain/enums/payment-type-enum";
import { ServiceState } from "../../../domain/enums/service-state-enum";
import { ValidationError } from "../../../domain/errors/index";
import { IServiceRepository } from "../../../domain/ports/IServiceRepository";
import { CreateServiceDTO } from "../../dtos/ServiceDTO";

export class CreateServiceUseCase {
    constructor(private readonly serviceRepository: IServiceRepository) { }

    public async execute(data: CreateServiceDTO): Promise<Service> {

        if (!data.serviceDescription || data.serviceDescription.trim().length < 10) {
            throw new ValidationError(
                'Errores de validación',
                {
                    descripcion_servicio: ['La descripción debe tener al menos 10 caracteres']
                }
            );
        }

        if (data.payment === PaymentType.TRUEQUE && !data.exchangeDetail) {
            throw new ValidationError(
                'Errores de validación',
                {
                    detalles_trueque: ['Los detalles del trueque son obligatorios']
                }
            );
        }

        const newService = new Service(
            data.requesterUserId,
            data.serviceDescription,
            data.originAddress,
            data.destinationAddress,
            ServiceState.PUBLICADO,
            data.payment,
            data.offeredValue,
            data.exchangeDetail || null,
            null,
            null,
        );

        return this.serviceRepository.createService(newService);
    }

}