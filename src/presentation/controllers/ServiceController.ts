import { NextFunction, Request, Response } from "express";
import { CreateServiceUseCase } from "../../application/use-cases/services/CreateServiceUseCase";
import { successResponse } from "../interfaces/ApiResponse";

export class ServiceController {
    constructor(private readonly createServiceUseCase: CreateServiceUseCase) { };

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
}