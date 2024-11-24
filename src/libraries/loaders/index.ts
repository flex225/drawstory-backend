import { Express } from "express"
import loadExpress from "./express.loader"
import { loadRedis } from "./redis.loader"
import { loadPrisma } from "../prisma/prisma.service"


const loaders = (app: Express) => {
    loadRedis()
    loadPrisma()
    loadExpress(app)
}

export default loaders