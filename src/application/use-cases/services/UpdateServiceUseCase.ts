import { PaymentType } from "../../../domain/enums/payment-type-enum";
import { ServiceState } from "../../../domain/enums/service-state-enum";
import { NotFoundError, ValidationError } from "../../../domain/errors";
import { ServiceRepository } from "../../../infrastructure/repositories/service.repository";
import { UpdateServiceDTO } from "../../dtos/ServiceDTO";


export class UpdateServiceUseCase {
    constructor(private readonly serviceRepository: ServiceRepository) { };

    async execute(id: string, data: UpdateServiceDTO) {

        const exisingService = await this.serviceRepository.findServiceById(id);
        console.log('Existente ', exisingService);
        console.log('Valores a actualiar', data);
        console.log(typeof data.offeredValue)

        if (!exisingService) {
            throw new NotFoundError('Servicio', id);
        }

        if (exisingService.serviceState === ServiceState.COMPLETADO) {
            throw new ValidationError('Error de validación', {
                estado_servicio: ['No se puede actualiar un servicio COMPLETADO']
            });
        }

        if (data.payment === PaymentType.DINERO && data.offeredValue === undefined) {
            throw new ValidationError('Error de validación', {
                valor_ofrecido: ['Si el método de pago es DINERO, el valor ofrecido debe tener un valor.']
            })
        }

        return await this.serviceRepository.updateService(id, data);


    }
}