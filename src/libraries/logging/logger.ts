import { Logging } from '@google-cloud/logging';
import config from '../../config';
import path from 'path';

const keyPath = path.resolve(process.cwd(), config.googleApplicationCredentials);

const logging = new Logging({ projectId: "drawstory-443616", keyFilename: keyPath });

const logName = "oauth-logs";
const log = logging.log(logName);

// Log an OAuth error
async function logOAuthError(message: string, error?: unknown) {
    const metadata = {
        resource: { type: 'global' },  // Set the resource type to global
    };

    const errorDetails = error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
    } : error;

    const entry = log.entry(metadata, { 
        message,
        error: errorDetails
    });
    await log.write(entry);
    console.log('OAuth error logged!');
}

export { logOAuthError };
