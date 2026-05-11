import { User } from "../entities/User";

export interface IAuthService {
    validateUser(token: string): Promise<User>;
}