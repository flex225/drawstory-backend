import jwt, {Jwt, JwtPayload } from "jsonwebtoken"
import config from "../../../config"

const SECRET_KEY = config.jwtSecret

export function generateToken(userId: string): string {
    if(SECRET_KEY.length === 0) {
        throw new Error("JWT secret not set")
    } else {
        return jwt.sign({ userId }, SECRET_KEY)
    }
}

export function verifyToken(token: string): Jwt | JwtPayload | string | null {
    try {
        return jwt.verify(token, SECRET_KEY)
    } catch (error) {
        return null
    }
}