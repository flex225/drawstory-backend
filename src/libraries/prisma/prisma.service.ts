import { PrismaClient } from "@prisma/client";
import { container, singleton } from "tsyringe";


@singleton()
export default class PrismaService extends PrismaClient {
    constructor() {
        super()
        this.registerShutdownHooks()
    }

    private registerShutdownHooks(): void {
        // Disconnect the Prisma Client on SIGINT (e.g., Ctrl+C)
        process.on('SIGINT', async () => {
            await this.$disconnect();
            process.exit(0);
        });

        // Disconnect the Prisma Client on SIGTERM (e.g., Kubernetes or Docker stop)
        process.on('SIGTERM', async () => {
            await this.$disconnect();
            process.exit(0);
        });
    }
}


export const loadPrisma = () => {
    container.resolve(PrismaService)
}