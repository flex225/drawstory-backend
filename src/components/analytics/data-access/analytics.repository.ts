import config, { Environment } from "../../../config";
import PrismaService from "../../../libraries/prisma/prisma.service";
import { autoInjectable } from "tsyringe";

type AnalyticsInfo = {
    email: string;
    lastLoginAt: string;
    projects: {
        id: string;
        title: string;
        createdAt: string;
        updatedAt: string;
        activeImages: number;
        last_created_scene: string | null;
    }[];
}

function formatDate(date: Date | null): string {
    if (!date) return "Never" 
    return date.toLocaleDateString('en-US', {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    })
}

@autoInjectable()
export default class AnalyticsRepository {
    constructor(private prisma: PrismaService) {}

    async getLatestInfo(): Promise<AnalyticsInfo[]> {
        const results = await this.prisma.user.findMany({
            where: {
                ...(config.env === Environment.Production && {
                    NOT: {
                        email: {
                            in: ['hayksmn@gmail.com', 'aakhnoyan@gmail.com']
                        }
                    }
                })
            },
            orderBy: [
                { email: 'asc' },
                { lastLoginAt: 'desc' }
            ],
            select: {
                email: true,
                lastLoginAt: true,
                projects: {
                    select: {
                        id: true,
                        title: true,
                        createdAt: true,
                        updatedAt: true,
                        _count: {
                            select: {
                                scenes: {
                                    where: {
                                        isDeleted: false
                                    }
                                }
                            }
                        },
                        scenes: {
                            orderBy: {
                                createdAt: 'desc'
                            },
                            take: 1,
                            select: {
                                createdAt: true
                            } 
                        }
                    }
                },
            }
        });

        return results.map(user => ({
            email: user.email,
            lastLoginAt: formatDate(user.lastLoginAt),
            projects: user.projects.map(project => ({
                id: project.id,
                title: project.title,
                createdAt: formatDate(project.createdAt),
                updatedAt: formatDate(project.updatedAt),
                activeImages: project._count.scenes,
                last_created_scene: formatDate(project.scenes[0]?.createdAt)
            })).sort((a, b) => {
                const bTime = b.last_created_scene ? new Date(b.last_created_scene).getTime() : 0;
                const aTime = a.last_created_scene ? new Date(a.last_created_scene).getTime() : 0;
                return bTime - aTime;
            })
        }));
    }
}
