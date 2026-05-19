import { Service } from '../entities/Service';
import { ServiceState } from '../enums/service-state-enum';

export interface IServiceRepository {
    createService(service: Omit<Service, 'id'>): Promise<Service>;
    findServiceById(id: string): Promise<Service | null>;
    findAllServices(): Promise<Service[]>;
    findServicesByState(state: ServiceState): Promise<Service[]>;
    updateService(
        id: string,
        data: Partial<Omit<Service, 'id' | 'requesterUserId'>>
    ): Promise<Service>;
    acceptService(serviceId: string, acceptingUserId: string): Promise<void>;
    softDeleteService(serviceId: string, requestingUserId: string): Promise<void>;
    completeService(serviceId: string): Promise<Service>;
    cancelService(serviceId: string, requestingUserId: string): Promise<Service>;
}