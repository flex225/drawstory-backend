import { Request } from "express"
import { ParamsDictionary } from "express-serve-static-core"

export interface CreateUserBody {
    email: string,
    password: string
}

export interface CreateUserResponse {
    token: string,
    userId: string
}

export interface GetUserParams extends ParamsDictionary {
    userId: string
}

export interface GetUserResponse {
    userId: string,
    email: string,
}

export interface UpdateUserBody {
    userId: string,
    email: string,
}

export interface UpdateUserResponse {
    userId: string,
    email: string,
}

export interface ErrorResponse {
    message: string,
    details?: string[]
}

export interface LoginRequest {
    email: string,
    password: string
}

export interface LoginResponse {
    token: string,
    userId: string
}

export interface LogoutRequest {
    userId: string
}

export interface LogoutResponse {
    message: string
}

export interface ValidatedRequest extends Request {
    userId: string
}

export interface CheckEmailAvailabilityRequest {
    email: string
}