import { Service } from '../entities/Service';
import { ServiceState } from '../enums/service-state-enum';

export interface IUserRepository {
    getUserServices(userId: string, serviceState?: ServiceState): Promise<Service[]>;
    getUserAcceptedServices(userId: string, serviceState?: ServiceState): Promise<Service[]>;
    getUserServiceHistory(userId: string): Promise<Service[]>;
    getUserStats(userId: string): Promise<{
        publicados: number;
        enProceso: number;
        completados: number;
        cancelados: number;
        aceptadosPorOtros: number;
    }>;
}