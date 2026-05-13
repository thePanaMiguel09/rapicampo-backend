import { Router } from "express";
import { ServiceController } from "../controllers/ServiceController";
import { CreateServiceUseCase } from "../../application/use-cases/services/CreateServiceUseCase";
import { FindServiceUseCase } from "../../application/use-cases/services/FindServiceUseCase";
import { GetAllServicesUseCase } from "../../application/use-cases/services/GetAllServicesUseCase";
import { ServiceRepository } from "../../infrastructure/repositories/service.repository";
import { UpdateServiceUseCase } from "../../application/use-cases/services/UpdateServiceUseCase";
import { AcceptServiceUseCase } from "../../application/use-cases/services/AcceptServiceUseCase";
import { SocketServer } from "../../infrastructure/websocket/SocketServer";
import { NotificationRepository } from "../../infrastructure/repositories/notification.repository";
import { NotificationService } from "../../infrastructure/services/NotificationService";

export const createServiceRouter = (authMiddleare: any, socketServer: any): Router => {
    const router = Router();

    const serviceRepository = new ServiceRepository();
    const notificationRepository = new NotificationRepository();
    const notificationService = new NotificationService(notificationRepository, socketServer);

    const createServiceUseCase = new CreateServiceUseCase(serviceRepository);
    const findServiceUseCase = new FindServiceUseCase(serviceRepository);
    const getAllServicesUseCase = new GetAllServicesUseCase(serviceRepository);
    const updateServiceUseCase = new UpdateServiceUseCase(serviceRepository);
    const acceptServiceUseCase = new AcceptServiceUseCase(serviceRepository, notificationService);

    const controller = new ServiceController(
        createServiceUseCase,
        findServiceUseCase,
        getAllServicesUseCase,
        updateServiceUseCase,
        acceptServiceUseCase
    );

    router.use(authMiddleare);

    router.post('/', (req, res, next) => controller.createService(req, res, next));

    router.get('/:id', (req, res, next) => controller.fetchServiceById(req, res, next));

    router.get('/', (req, res, next) => controller.fetchAllServices(req, res, next));

    router.put('/:id', (req, res, next) => controller.updaService(req, res, next));

    router.post('/:id/accept', (req, res, next) => controller.acceptService(req, res, next)); // Nueva ruta


    return router;
}