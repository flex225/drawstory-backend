
export interface UserDto {
    id: string,
    email: string,
    password?: string | null,
    createdAt: Date,
    updatedAt: Date
}