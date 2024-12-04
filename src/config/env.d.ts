declare global {
    namespace NodeJS {
        interface ProcessEnv {
            PORT: string,
            NODE_ENV: 'development' | 'test' | 'production',
            JWT_SECRET: string,
            REDIS_URL: string,
            REDIS_PASSWORD: string,
            AWS_ACCESS_KEY_ID: string,
            AWS_SECRET_ACCESS_KEY: string,
            AWS_REGION: string,
            AWS_S3_BUCKET_NAME: string,
            GOOGLE_CLIENT_ID: string,
            GOOGLE_CLIENT_SECRET: string
        }
    }
}