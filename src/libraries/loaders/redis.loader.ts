import { createClient, RedisClientType } from "redis"
import { container, singleton } from "tsyringe"
import config, { Environment } from "../../config";

export interface RedisValue {
    token: string,
    userId: string
}

@singleton()
export default class RedisService {

    private static readonly REDIS_SESSION_KEY_PREFIX = 'session:';
    private redisClient: RedisClientType

    constructor() {
        const url = config.redisUrl
        const pass = config.redisPassword
        if (url.length === 0) throw new Error("Redis url not set")
        if (pass.length === 0) throw new Error("Redis password not set")

        this.redisClient = createClient({ url: url, password: pass })
        if (config.env === Environment.Development) {
            this.redisClient.on('error', (err) => console.log("Redis error", err))
        }
        this.connect()
        this.registerShutdownHooks()
    }

    private async connect() {
        try {
            await this.redisClient.connect();
        } catch (error) {
            if (config.env === Environment.Development) {
                console.error("Failed to connect to Redis:", error);
            }
        }
    }

    private registerShutdownHooks(): void {
        // Disconnect the Redis Client on SIGINT (e.g., Ctrl+C)
        process.on('SIGINT', async () => {
            await this.redisClient.disconnect()
            process.exit(0)
        });

        // Disconnect the Redis Client on SIGTERM (e.g., Kubernetes or Docker stop)
        process.on('SIGTERM', async () => {
            await this.redisClient.disconnect()
            process.exit(0)
        });
    }

    public async set(key: string, value: RedisValue): Promise<string | null> {
        return await this.redisClient.set(`${RedisService.REDIS_SESSION_KEY_PREFIX}${key}`, JSON.stringify(value))
    }

    public async del(key: string): Promise<number> {
        return await this.redisClient.del(`${RedisService.REDIS_SESSION_KEY_PREFIX}${key}`)
    }

    public async get(key: string): Promise<string | null> {
        return await this.redisClient.get(`${RedisService.REDIS_SESSION_KEY_PREFIX}${key}`)
    }
}

export const loadRedis = () => {
    container.resolve(RedisService)
}