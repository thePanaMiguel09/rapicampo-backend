import { Router } from "express";
import { ServiceController } from "../controllers/ServiceController";
import { CreateServiceUseCase } from "../../application/use-cases/services/CreateServiceUseCase";
import { FindServiceUseCase } from "../../application/use-cases/services/FindServiceUseCase";
import { GetAllServicesUseCase } from "../../application/use-cases/services/GetAllServicesUseCase";
import { ServiceRepository } from "../../infrastructure/repositories/service.repository";
import { UpdateServiceUseCase } from "../../application/use-cases/services/UpdateServiceUseCase";

export const createServiceRouter = (authMiddleare: any): Router => {
    const router = Router();

    const serviceRepository = new ServiceRepository();
    const createServiceUseCase = new CreateServiceUseCase(serviceRepository);
    const findServiceUseCase = new FindServiceUseCase(serviceRepository);
    const getAllServicesUseCase = new GetAllServicesUseCase(serviceRepository);
    const updateServiceUseCase = new UpdateServiceUseCase(serviceRepository);

    const controller = new ServiceController(
        createServiceUseCase,
        findServiceUseCase,
        getAllServicesUseCase,
        updateServiceUseCase
    );

    router.use(authMiddleare);

    router.post('/', (req, res, next) => controller.createService(req, res, next));

    router.get('/:id', (req, res, next) => controller.fetchServiceById(req, res, next));

    router.get('/', (req, res, next) => controller.fetchAllServices(req, res, next));

    router.put('/:id', (req, res, next) => controller.updaService(req, res, next));

    return router;
}