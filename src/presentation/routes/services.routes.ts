import { Router } from "express";
import { ServiceController } from "../controllers/ServiceController";
import { CreateServiceUseCase } from "../../application/use-cases/services/CreateServiceUseCase";
import { FindServiceUseCase } from "../../application/use-cases/services/FindServiceUseCase";
import { GetAllServicesUseCase } from "../../application/use-cases/services/GetAllServicesUseCase";
import { ServiceRepository } from "../../infrastructure/repositories/service.repository";

export const createServiceRouter = (authMiddleare: any): Router => {
    const router = Router();

    const serviceRepository = new ServiceRepository();
    const createServiceUseCase = new CreateServiceUseCase(serviceRepository);
    const findServiceUseCase = new FindServiceUseCase(serviceRepository);
    const getAllServicesUseCase = new GetAllServicesUseCase(serviceRepository);

    const controller = new ServiceController(
        createServiceUseCase
    );

    router.use(authMiddleare);

    router.post('/', (req, res, next) => controller.createService(req, res, next));

    return router;
}