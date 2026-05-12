import {Request, Response, NextFunction } from "express";
import { FetchUserServicesUseCase } from "../../application/use-cases/users/FetchUserServices";
import { ServiceState } from "../../domain/enums/service-state-enum";
import { successResponse } from "../interfaces/ApiResponse";

export class UserController {
    constructor(
        private readonly fetchUserServicesUseCase: FetchUserServicesUseCase
    ){}

    async fetchUserServices(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const {id} = req.params;

            const serviceState = req.query.state as ServiceState;

            const userServices = await this.fetchUserServicesUseCase.execute(id, serviceState);

            res.status(200).json(successResponse(userServices));


        } catch (error) {
            next(error);
        }
    }
}