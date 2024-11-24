declare global {
    namespace NodeJS {
        interface ProcessEnv {
            PORT: string,
            NODE_ENV: 'development' | 'test' | 'production',
            JWT_SECRET: string,
            REDIS_URL: string,
            REDIS_PASSWORD: string
        }
    }
}