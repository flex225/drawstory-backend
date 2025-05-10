import { Logging } from '@google-cloud/logging';
const logging = new Logging();

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
