import { Router } from "express";
import { UserRepository } from "../../infrastructure/repositories/user.repository";
import { FetchUserServicesUseCase } from "../../application/use-cases/users/FetchUserServices";
import { UserController } from "../controllers/UserController";
import { FetchUserAcceptedServicesUseCase } from "../../application/use-cases/users/FetchAcceptedServicesUseCase";
import { FetchUserStatsUseCase } from "../../application/use-cases/users/FetchUserStatsUseCase";


export const createUserRouter = (authMiddleware: ReturnType<typeof import('../middleware/authMiddleware')['createAuthMiddleware']>): Router => {
    const router = Router();

    const userRepository = new UserRepository();

    const fetchUserServicesUseCase = new FetchUserServicesUseCase(userRepository);
    const fetchUserAcceptedServicesUseCase = new FetchUserAcceptedServicesUseCase(userRepository);
    const fetchUserStatsUseCase = new FetchUserStatsUseCase(userRepository);

    const controller = new UserController(
        fetchUserServicesUseCase,
        fetchUserAcceptedServicesUseCase,
        fetchUserStatsUseCase,
    );

    router.use(authMiddleware);

    router.get('/:id/services', (req, res, next) => controller.fetchUserServices(req, res, next));

    router.get('/:id/accepted-services', (req, res, next) => controller.fetchUserAcceptedServices(req, res, next));

    router.get('/:id/stats', (req, res, next) => controller.fetchUserStats(req, res, next));

    return router;
};