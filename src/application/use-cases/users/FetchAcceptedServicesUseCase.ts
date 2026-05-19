import { Service } from "../../../domain/entities/Service";
import { ServiceState } from "../../../domain/enums/service-state-enum";
import { IUserRepository } from "../../../domain/ports/IUserRepository";

export class FetchUserAcceptedServicesUseCase {
    constructor(private readonly userRepository: IUserRepository) { }

    async execute(userId: string, filterServiceState?: ServiceState): Promise<Service[]> {
        return this.userRepository.getUserAcceptedServices(userId, filterServiceState);
    }
}