import { Service } from "../entities/Service";
import { ServiceState } from "../enums/service-state-enum";


export interface IUserRepository {
    getUserServices(id: string, filterState: ServiceState): Promise<Service[]>;
}