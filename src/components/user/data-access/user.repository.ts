import { autoInjectable } from "tsyringe";
import PrismaService from "../../../libraries/prisma/prisma.service";
import { UserDto } from "../domain/dtos/user.dto";
import { User } from "@prisma/client";

@autoInjectable()
export default class UserRepository {
    constructor(private prisma: PrismaService) {}


    async getUserById(userId: string): Promise<User|null> {
        return await this.prisma.user.findUnique({where: {id: userId}})
    }

    async getUserByEmail(email: string): Promise<User|null> {
        return await this.prisma.user.findUnique({where: {email: email}})
    }

    async createUser(email: string, password: string): Promise<User> {
        return await this.prisma.user.create({
            data: {
                email: email,
                password: password
            }
        })
    }

    async createSocialUser(email: string, socialId: string, provider: string, fullname?: string): Promise<User> {
        return await this.prisma.user.create({
            data: {
                email: email,
                fullname: fullname,
                providerId: socialId,
                provider: provider
            }
        })
    }

    async updateUser(updatedUser: UserDto): Promise<User> {
        return await this.prisma.user.update({
            where: {id: updatedUser.id},
            data: {
                email: updatedUser.email,
                fullname: updatedUser.fullname
            }
        })
    }

    async findEmail(email: string): Promise<User|null> {
        return await this.prisma.user.findFirst({
            where: {
                email: email
            }
        })
    }

    async updateLastLogin(userId: string) {
        await this.prisma.user.update({
            where: {id: userId},
            data: {lastLoginAt: new Date()}
        })
    }
}