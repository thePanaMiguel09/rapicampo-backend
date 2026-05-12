import { NextFunction, Request, Response } from "express";
import { CreateServiceUseCase } from "../../application/use-cases/services/CreateServiceUseCase";
import { successResponse } from "../interfaces/ApiResponse";
import { FindServiceUseCase } from "../../application/use-cases/services/FindServiceUseCase";
import { GetAllServicesUseCase } from "../../application/use-cases/services/GetAllServicesUseCase";
import { UpdateServiceUseCase } from "../../application/use-cases/services/UpdateServiceUseCase";
import { FetchUserServicesUseCase } from "../../application/use-cases/users/FetchUserServices";

export class ServiceController {
    constructor(
        private readonly createServiceUseCase: CreateServiceUseCase,
        private readonly findServiceByIdUseCase: FindServiceUseCase,
        private readonly fetchAllServicesUseCase: GetAllServicesUseCase,
        private readonly updateServiceUseCase: UpdateServiceUseCase,
    ) { };

    async createService(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const service = await this.createServiceUseCase.execute({
                ...req.body,
                requesterUserId: req.usuario!.id
            });

            const response = successResponse(service);
            res.status(201).json(response);

        } catch (error) {
            next(error);
        }
    }

    async fetchServiceById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const service = await this.findServiceByIdUseCase.execute(req.params.id);

            res.status(200).json(successResponse(service));

        } catch (error) {
            next(error);
        }
    }

    async fetchAllServices(_req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const services = await this.fetchAllServicesUseCase.execute();
            res.status(200).json(successResponse(services));
        } catch (error) {
            next(error);
        }
    }

    async updaService(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const updatedService = await this.updateServiceUseCase.execute(id, req.body);
            res.status(200).json(successResponse(updatedService));
        } catch (error) {
            next(error);
        }
    }
}