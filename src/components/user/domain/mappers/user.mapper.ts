import { User } from "@prisma/client"
import { UserDto } from "../dtos/user.dto"

export function mapUserToUserDto(user: User, shouldGivePassword: boolean = false): UserDto {
    return shouldGivePassword ? 
    {
        id: user.id,
        email: user.email,
        password: user.password,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        fullname: user.fullname,
        provider: user.provider,
    } : 
    {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        fullname: user.fullname,
        provider: user.provider,
    }
}