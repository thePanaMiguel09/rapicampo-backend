import { Service } from "../entities/Service";
import { ServiceState } from "../enums/service-state-enum";

export interface IServiceRepository {
    createService(service: Omit<Service, 'id'>): Promise<Service>;
    findServiceById(id: string): Promise<Service | null>;
    findAllServices(): Promise<Service[]>;
    updateService(id: string, data: Partial<Omit<Service, 'id' | 'id_usuario_solicitante'>>): Promise<Service>;
}