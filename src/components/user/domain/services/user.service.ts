import { autoInjectable } from "tsyringe";
import UserRepository from "../../data-access/user.repository";
import { hashPassword } from "../../../../libraries/auth/hash.service";
import { UserDto } from "../dtos/user.dto";
import { mapUserToUserDto } from "../mappers/user.mapper";


@autoInjectable()
export default class UserService {
    constructor(private userRepository: UserRepository) {}

    async getUserById(userId: string, shouldGivePassword: boolean = false) {
        const user = await this.userRepository.getUserById(userId)
        return user ? mapUserToUserDto(user, shouldGivePassword) : null
    }

    async getUserByEmail(email: string, shouldGivePassword: boolean = false) {
        const user = await this.userRepository.getUserByEmail(email)
        return user ? mapUserToUserDto(user, shouldGivePassword) : null
    }

    async createUser(email: string, password: string) {
        const hashedPassword = await hashPassword(password)
        const newUser = await this.userRepository.createUser(email, hashedPassword)
        return mapUserToUserDto(newUser)
    }

    async updateUser(updatedUser: UserDto) {
        const result = await this.userRepository.updateUser(updatedUser)
        return mapUserToUserDto(result)
    }
}