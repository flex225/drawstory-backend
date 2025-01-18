import { autoInjectable } from "tsyringe";
import AnalyticsRepository from "../../data-access/analytics.repository";
import { json2csv } from "json-2-csv";
import { PutObjectCommand, PutObjectCommandInput } from "@aws-sdk/client-s3";
import config from "../../../../config";
import s3Client from "../../../../libraries/aws/aws.client";


@autoInjectable()
export default class AnalyticsService {
    constructor(private analyticsRepository: AnalyticsRepository) { }

    async getLatestInfoAsCsv(): Promise<string> {
        const data = await this.analyticsRepository.getLatestInfo();

        // Flatten the data structure
        const flatData = data.flatMap(user =>
            user.projects.map(project => ({
                user_email: user.email,
                last_login: user.lastLoginAt,
                project_id: project.id,
                project_title: project.title,
                project_created_at: project.createdAt,
                project_updated_at: project.updatedAt,
                active_scenes: project.activeImages,
                last_scene_created_at: project.last_created_scene
            }))
        )
        const csv = json2csv(flatData)
        const date = new Date()
        const folder = `${date.getFullYear()}-${date.toLocaleString('default', { month: 'short' })}`
        const fileName = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}.csv`

        const key = `analytics/${folder}/${fileName}`
        const uploadParams: PutObjectCommandInput = {
            Bucket: config.awsConfig.bucketName,
            Key: key,
            Body: csv,
            ContentType: 'text/csv'
        };

        // Create and send the command to upload the file
        const command = new PutObjectCommand(uploadParams);
        await s3Client.send(command);

        // Construct and return the URL for the uploaded file
        return `https://${config.awsConfig.bucketName}.s3.${config.awsConfig.region}.amazonaws.com/${uploadParams.Key}`;
    }
}
