import { GetSendQuotaCommand, SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { singleton } from 'tsyringe';
import config from '../../../../config';

@singleton()
export default class EmailService {
    private sesClient: SESClient;
    private isInSandbox: boolean = true;
    private marketingEmail: string = "marketing@drawstory.ai";

    constructor() {
        this.sesClient = new SESClient({
            region: config.awsSesConfig.region,
            credentials: {
                accessKeyId: config.awsSesConfig.accessKey,
                secretAccessKey: config.awsSesConfig.secretAccessKey
            }
        });
        this.checkSandboxMode();
    }


    private async checkSandboxMode(): Promise<void> {
        try {
            const quotaResponse = await this.sesClient.send(new GetSendQuotaCommand({}));

            this.isInSandbox = quotaResponse.Max24HourSend === 200;
            
            console.log('SES Configuration:', {
                isInSandbox: this.isInSandbox,
                max24HourSend: quotaResponse.Max24HourSend,
                maxSendRate: quotaResponse.MaxSendRate,
                sentLast24Hours: quotaResponse.SentLast24Hours
            });
        } catch (error) {
            console.error('Error checking SES sandbox mode:', error);
            this.isInSandbox = true;
        }
    }

    async sendWelcomeEmail(to: string): Promise<boolean> {
        const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333333;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }
                .header {
                    text-align: center;
                    padding: 20px 0;
                }
                .content {
                    background-color: #ffffff;
                    padding: 20px;
                    border-radius: 5px;
                }
                .email-info {
                    background-color: #f5f5f5;
                    padding: 10px;
                    border-radius: 3px;
                    margin: 20px 0;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Welcome to DrawStory! 🎨</h1>
                </div>
                <div class="content">
                    <p>Hi there!</p>
                    <p>Thank you for joining DrawStory. We're excited to have you on board!</p>
                    <div class="email-info">
                        <p>You registered with: <strong>${to}</strong></p>
                    </div>
                    <p>If you have any questions, feel free to reach out to our support team.</p>
                    <p>Best regards,<br>The DrawStory Team</p>
                </div>
            </div>
        </body>
        </html>
    `
        return this.sendEmail(to, "Welcome to DrawStory", html)
    }

    async sendMarketingEmail(newEmail: string): Promise<boolean> {
        const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333333;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }
                .content {
                    background-color: #ffffff;
                    padding: 20px;
                    border-radius: 5px;
                }
                .email-info {
                    background-color: #f5f5f5;
                    padding: 10px;
                    border-radius: 3px;
                    margin: 20px 0;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="content">
                    <div class="email-info">
                        <p>New user registered with: <strong>${newEmail}</strong></p>
                    </div>
                </div>
            </div>
        </body>
        </html>
        `
        return this.sendEmail(this.marketingEmail, "New user registered on DrawStory", html)
    }

    async sendEmail(
        to: string, 
        subject: string, 
        html: string
    ): Promise<boolean> {
        try {
            const command = new SendEmailCommand({
                Source: 'no-reply@drawstory.ai',
                Destination: {
                    ToAddresses: [to]
                },
                Message: {
                    Subject: {
                        Data: subject
                    },
                    Body: {
                        Html: {
                            Data: html
                        }
                    }
                }
            });

            await this.sesClient.send(command);
            return true;
        } catch (error) {
            console.error('Error sending email:', error);
            return false;
        }
    }
}
