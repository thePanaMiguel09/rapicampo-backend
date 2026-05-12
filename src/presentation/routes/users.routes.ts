import { NextFunction, Router } from "express";
import { UserReposiroty } from "../../infrastructure/repositories/user.repository";
import { FetchUserServicesUseCase } from "../../application/use-cases/users/FetchUserServices";
import { UserController } from "../controllers/UserController";


export const createUserRouter = (authMiddleware: any): Router => {
    const router = Router();
 
    const userRepository = new UserReposiroty();
    const fetchUserServicesUseCase = new FetchUserServicesUseCase(userRepository);
    
    const controller = new UserController(fetchUserServicesUseCase);
    
    router.use(authMiddleware);    

    router.get('/:id/services', (req, res, next) => controller.fetchUserServices(req, res, next));

    return router;

}