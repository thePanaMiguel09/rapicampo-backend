import { Router } from 'express';
import { ServiceController } from '../controllers/ServiceController';

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

import { ServiceRepository } from '../../infrastructure/repositories/service.repository';
import { NotificationRepository } from '../../infrastructure/repositories/notification.repository';
import { NotificationService } from '../../infrastructure/services/NotificationService';
import { SocketServer } from '../../infrastructure/websocket/SocketServer';

export const createServiceRouter = (authMiddleware: ReturnType<typeof import('../middleware/authMiddleware')['createAuthMiddleware']>, socketServer: SocketServer): Router => {
    const router = Router();

    const serviceRepository = new ServiceRepository();
    const notificationRepository = new NotificationRepository();
    const notificationService = new NotificationService(notificationRepository, socketServer);

    const createServiceUseCase = new CreateServiceUseCase(serviceRepository);
    const findServiceUseCase = new FindServiceUseCase(serviceRepository);
    const getAllServicesUseCase = new GetAllServicesUseCase(serviceRepository);
    const updateServiceUseCase = new UpdateServiceUseCase(serviceRepository);
    const acceptServiceUseCase = new AcceptServiceUseCase(serviceRepository, notificationService);
    const deleteServiceUseCase = new DeleteServiceUseCase(serviceRepository);
    const completeServiceUseCase = new CompleteServiceUseCase(serviceRepository, notificationService);
    const cancelServiceUseCase = new CancelServiceUseCase(serviceRepository, notificationService);

    const controller = new ServiceController(
        createServiceUseCase,
        findServiceUseCase,
        getAllServicesUseCase,
        updateServiceUseCase,
        acceptServiceUseCase,
        deleteServiceUseCase,
        completeServiceUseCase,
        cancelServiceUseCase,
    );

    router.use(authMiddleware);

    router.post('/', (req, res, next) => controller.createService(req, res, next));
    router.get('/', (req, res, next) => controller.fetchAllServices(req, res, next));
    router.get('/:id', (req, res, next) => controller.fetchServiceById(req, res, next));
    router.put('/:id', (req, res, next) => controller.updateService(req, res, next));
    router.delete('/:id', (req, res, next) => controller.deleteService(req, res, next));

    router.post('/:id/accept', (req, res, next) => controller.acceptService(req, res, next));
    router.post('/:id/complete', (req, res, next) => controller.completeService(req, res, next));
    router.post('/:id/cancel', (req, res, next) => controller.cancelService(req, res, next));

    return router;
};