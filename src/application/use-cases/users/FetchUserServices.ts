import { Service } from "../../../domain/entities/Service";
import { ServiceState } from "../../../domain/enums/service-state-enum";
import { IUserRepository } from "../../../domain/ports/IUserRepository";
import { UserReposiroty } from "../../../infrastructure/repositories/user.repository";


export class FetchUserServicesUseCase {
    constructor(private readonly userRepository: IUserRepository) { };

    async execute(id: string, filterServiceState: ServiceState): Promise<Service[]> {
        return await this.userRepository.getUserServices(id, filterServiceState);
    }
} 