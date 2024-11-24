import dotenv from "dotenv"

dotenv.config()

export enum Environment {
    Development = 'development',
    Test = 'test',
    Production = 'production',
}

interface ProjectConfig {
    port: number,
    env: Environment,
    jwtSecret: string,
    redisUrl: string,
    redisPassword: string
}

const config: ProjectConfig = {
    port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
    env: (process.env.NODE_ENV as Environment) || Environment.Development,
    jwtSecret: process.env.JWT_SECRET || "",
    redisUrl: process.env.REDIS_URL || "",
    redisPassword: process.env.REDIS_PASSWORD || ""
}

export default config