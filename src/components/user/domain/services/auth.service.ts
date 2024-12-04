import { autoInjectable } from "tsyringe";
import UserService from "./user.service";
import RedisService from "../../../../libraries/loaders/redis.loader";
import { verifyPassword } from "../../../../libraries/auth/hash.service";
import { generateToken } from "../../../../libraries/auth/jwt/jwt.service";


@autoInjectable()
export default class AuthService {
    constructor(private userService: UserService, private redisService: RedisService) {}

    async loginUser(email: string, password: string): Promise<{ token: string, userId: string } | null> {
        const user = await this.userService.getUserByEmail(email, true);
        if (user && user.password) {
            const isPasswordValid = await verifyPassword(password, user.password);
            if (isPasswordValid) {
                const token = generateToken(user.id);
                await this.redisService.set(user.id, {userId: user.id, token: token});

                return { token, userId: user.id };
            }
        }
        return null;
    }

    async loginSocialUser(email: string): Promise<{ token: string, userId: string } | null> {
        const user = await this.userService.getUserByEmail(email);
        if (user) {
            const token = generateToken(user.id);
            await this.redisService.set(user.id, { userId: user.id, token: token });

            return { token, userId: user.id };
        }
        return null;
    }

    async logoutUser(userId: string): Promise<void> {
        await this.redisService.del(userId)
    }
}