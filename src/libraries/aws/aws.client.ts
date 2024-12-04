import { S3Client } from "@aws-sdk/client-s3";
import config from "../../config";

const { awsConfig } = config

const s3Client = new S3Client({
    region: awsConfig.region,
    credentials: {
        accessKeyId: awsConfig.accessKey,
        secretAccessKey: awsConfig.secretAccessKey
    }
})

export default s3Client