import { autoInjectable } from "tsyringe";
import UserService from "./user.service";
import RedisService from "../../../../libraries/loaders/redis.loader";
import { verifyPassword } from "../../../../libraries/auth/hash.service";
import { generateToken } from "../../../../libraries/auth/jwt/jwt.service";


@autoInjectable()
export default class AuthService {
    constructor(private userService: UserService, private redisService: RedisService) { }

    async loginUser(email: string, password: string): Promise<{ token: string, userId: string, name?: string | null } | null> {
        const user = await this.userService.getUserByEmail(email, true);
        if (user && user.password) {
            const isPasswordValid = await verifyPassword(password, user.password);
            if (isPasswordValid) {
                const token = generateToken(user.id);
                await this.redisService.set(user.id, { userId: user.id, token: token });

                return { token, userId: user.id, name: user.fullname };
            }
        }
        return null;
    }

    async loginSocialUser(email: string, name?: string): Promise<{ token: string, userId: string, name?: string | null } | null> {
        console.log("🚀 ~ AuthService ~ loginSocialUser ~ email: string, name?: string:", email, name)
        const user = await this.userService.getUserByEmail(email);
        if (user) {
            if (!user.fullname && name) {
                console.log("🚀 ~ AuthService ~ loginSocialUser ~ user.fullname && name:", user.fullname, name)
                await this.userService.updateUser({ ...user, fullname: name })
            }
            const token = generateToken(user.id);
            await this.redisService.set(user.id, { userId: user.id, token: token });

            console.log("🚀 ~ AuthService ~ loginSocialUser ~ { token, userId: user.id, name: user.fullname ?? name }:", { token, userId: user.id, name: user.fullname ?? name })
            return { token, userId: user.id, name: user.fullname ?? name };
        }
        return null;
    }

    async logoutUser(userId: string): Promise<void> {
        await this.redisService.del(userId)
    }
}