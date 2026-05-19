import { Request, Response, NextFunction } from 'express';
import {
    FetchUserServicesUseCase,
} from '../../application/use-cases/users/FetchUserServices';
import { FetchUserAcceptedServicesUseCase } from '../../application/use-cases/users/FetchAcceptedServicesUseCase';
import { FetchUserStatsUseCase } from '../../application/use-cases/users/FetchUserStatsUseCase';

import { ServiceState } from '../../domain/enums/service-state-enum';
import { successResponse } from '../interfaces/ApiResponse';
import { ForbiddenError } from '../../domain/errors';

export class UserController {
    constructor(
        private readonly fetchUserServicesUseCase: FetchUserServicesUseCase,
        private readonly fetchUserAcceptedServicesUseCase: FetchUserAcceptedServicesUseCase,
        private readonly fetchUserStatsUseCase: FetchUserStatsUseCase,
    ) { }

    // GET /api/users/:id/services?state=PUBLICADO
    // Servicios publicados por el usuario (como solicitante)
    async fetchUserServices(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;

            // Solo el propio usuario puede ver sus servicios
            if (req.usuario!.id !== id) {
                throw new ForbiddenError('No puedes ver los servicios de otro usuario');
            }

            const serviceState = req.query.state
                ? (req.query.state as ServiceState)
                : undefined;

            const userServices = await this.fetchUserServicesUseCase.execute(id, serviceState);
            res.status(200).json(successResponse(userServices));
        } catch (error) {
            next(error);
        }
    }

    // GET /api/users/:id/accepted-services?state=EN_PROCESO
    // Servicios que el usuario aceptó (como realizador)
    async fetchUserAcceptedServices(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;

            if (req.usuario!.id !== id) {
                throw new ForbiddenError('No puedes ver los servicios de otro usuario');
            }

            const serviceState = req.query.state
                ? (req.query.state as ServiceState)
                : undefined;

            const services = await this.fetchUserAcceptedServicesUseCase.execute(id, serviceState);
            res.status(200).json(successResponse(services));
        } catch (error) {
            next(error);
        }
    }

    // GET /api/users/:id/stats
    async fetchUserStats(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;

            if (req.usuario!.id !== id) {
                throw new ForbiddenError('No puedes ver las estadísticas de otro usuario');
            }

            const stats = await this.fetchUserStatsUseCase.execute(id);
            res.status(200).json(successResponse(stats));
        } catch (error) {
            next(error);
        }
    }
}