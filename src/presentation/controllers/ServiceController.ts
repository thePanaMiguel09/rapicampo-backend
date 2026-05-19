import { NextFunction, Request, Response } from 'express';
import { CreateServiceUseCase } from '../../application/use-cases/services/CreateServiceUseCase';
import { FindServiceUseCase } from '../../application/use-cases/services/FindServiceUseCase';
import { GetAllServicesUseCase } from '../../application/use-cases/services/GetAllServicesUseCase';
import { UpdateServiceUseCase } from '../../application/use-cases/services/UpdateServiceUseCase';
import { AcceptServiceUseCase } from '../../application/use-cases/services/AcceptServiceUseCase';
import {
    DeleteServiceUseCase,
} from '../../application/use-cases/services/DeleteServiceUseCase';
import { CompleteServiceUseCase } from '../../application/use-cases/services/CompleteServiceUseCase';
import { CancelServiceUseCase } from '../../application/use-cases/services/CancelServiceUseCase';

import { successResponse } from '../interfaces/ApiResponse';

export class ServiceController {
    constructor(
        private readonly createServiceUseCase: CreateServiceUseCase,
        private readonly findServiceByIdUseCase: FindServiceUseCase,
        private readonly fetchAllServicesUseCase: GetAllServicesUseCase,
        private readonly updateServiceUseCase: UpdateServiceUseCase,
        private readonly acceptServiceUseCase: AcceptServiceUseCase,
        private readonly deleteServiceUseCase: DeleteServiceUseCase,
        private readonly completeServiceUseCase: CompleteServiceUseCase,
        private readonly cancelServiceUseCase: CancelServiceUseCase,
    ) { }

    // POST /api/services
    async createService(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const service = await this.createServiceUseCase.execute({
                ...req.body,
                requesterUserId: req.usuario!.id,
            });
            res.status(201).json(successResponse(service));
        } catch (error) {
            next(error);
        }
    }

    // GET /api/services/:id
    async fetchServiceById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const service = await this.findServiceByIdUseCase.execute(req.params.id);
            res.status(200).json(successResponse(service));
        } catch (error) {
            next(error);
        }
    }

    // GET /api/services
    async fetchAllServices(_req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const services = await this.fetchAllServicesUseCase.execute();
            res.status(200).json(successResponse(services));
        } catch (error) {
            next(error);
        }
    }

    // PUT /api/services/:id
    async updateService(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const updatedService = await this.updateServiceUseCase.execute(req.params.id, req.body);
            res.status(200).json(successResponse(updatedService));
        } catch (error) {
            next(error);
        }
    }

    // POST /api/services/:id/accept
    async acceptService(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            await this.acceptServiceUseCase.execute(
                req.params.id,
                req.usuario!.id,
                req.usuario!.nombre || 'Usuario',
            );
            res.status(200).json(successResponse({ message: 'Servicio aceptado exitosamente' }));
        } catch (error) {
            next(error);
        }
    }

    // DELETE /api/services/:id
    async deleteService(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            await this.deleteServiceUseCase.execute(req.params.id, req.usuario!.id);
            res.status(200).json(successResponse({ message: 'Servicio eliminado exitosamente' }));
        } catch (error) {
            next(error);
        }
    }

    // POST /api/services/:id/complete
    async completeService(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const service = await this.completeServiceUseCase.execute(req.params.id, req.usuario!.id);
            res.status(200).json(successResponse(service));
        } catch (error) {
            next(error);
        }
    }

    // POST /api/services/:id/cancel
    async cancelService(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const service = await this.cancelServiceUseCase.execute(req.params.id, req.usuario!.id);
            res.status(200).json(successResponse(service));
        } catch (error) {
            next(error);
        }
    }
}