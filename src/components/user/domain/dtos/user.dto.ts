
export interface UserDto {
    id: string,
    fullname?: string | null,
    email: string,
    password?: string | null,
    createdAt: Date,
    updatedAt: Date
}