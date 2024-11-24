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

    async updateUser(updatedUser: UserDto): Promise<User> {
        return await this.prisma.user.update({
            where: {id: updatedUser.id},
            data: {
                email: updatedUser.email
            }
        })
    }
}