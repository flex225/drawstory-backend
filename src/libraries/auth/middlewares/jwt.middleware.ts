import { container } from "tsyringe";
import { NextFunction, Request, Response } from "express";
import config from "../../../config";
import RedisService from "../../loaders/redis.loader";
import { verifyToken } from "../jwt/jwt.service";
import { ValidatedRequest } from "../../../components/user/entry-points/api/dtos/userCrud.dto";


const SECRET_KEY = config.jwtSecret
if (SECRET_KEY.length === 0) throw new Error("JWT Secret not set")
const redisService = container.resolve(RedisService)

export const authenticateJWT = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '')
        if (!token) {
            throw new Error("Auth failed. token missing")
        }

        const decodedToken = verifyToken(token)
        if(!decodedToken) {
            throw new Error("Auth failed. token invalid")
        }

        const { userId } = decodedToken as {userId: string}
        const user = await redisService.get(userId)
        if(!user) {
            throw new Error("Auth failed. invalid token")
        }
        
        (req as ValidatedRequest).userId = userId;
        next()
    } catch (error) {
        res.sendStatus(401)
    }
};

export default authenticateJWT