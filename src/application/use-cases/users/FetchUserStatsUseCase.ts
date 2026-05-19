import { IUserRepository } from "../../../domain/ports/IUserRepository";

export class FetchUserStatsUseCase {
    constructor(private readonly userRepository: IUserRepository) { }

    async execute(userId: string): Promise<{
        publicados: number;
        enProceso: number;
        completados: number;
        cancelados: number;
        aceptadosPorOtros: number;
    }> {
        return this.userRepository.getUserStats(userId);
    }
}