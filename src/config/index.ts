export enum Environment {
    Development = 'development',
    Test = 'test',
    Production = 'production',
}

interface AwsConfig {
    accessKey: string,
    secretAccessKey: string,
    region: string,
    bucketName: string
}

interface AwsSesConfig {
    accessKey: string,
    secretAccessKey: string,
    region: string
}

interface ProjectConfig {
    port: number,
    env: Environment,
    jwtSecret: string,
    redisUrl: string,
    redisPassword: string,
    awsConfig: AwsConfig,
    googleClientId: string,
    googleClientSecret: string,
    awsSesConfig: AwsSesConfig
}

const config: ProjectConfig = {
    port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
    env: (process.env.NODE_ENV as Environment) || Environment.Development,
    jwtSecret: process.env.JWT_SECRET || "",
    redisUrl: process.env.REDIS_URL || "",
    redisPassword: process.env.REDIS_PASSWORD || "",
    awsConfig: {
        accessKey: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
        region: process.env.AWS_REGION || "",
        bucketName: process.env.AWS_S3_BUCKET_NAME || "",
    },
    googleClientId: process.env.GOOGLE_CLIENT_ID || "",
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    awsSesConfig: {
        accessKey: process.env.AWS_SES_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SES_SECRET_ACCESS_KEY || "",
        region: process.env.AWS_SES_REGION || ""
    }
}

export default config