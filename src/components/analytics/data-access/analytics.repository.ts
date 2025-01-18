import PrismaService from "../../../libraries/prisma/prisma.service";
import { autoInjectable } from "tsyringe";

type AnalyticsInfo = {
    email: string;
    lastLoginAt: Date;
    projects: {
        id: string;
        title: string;
        createdAt: Date;
        updatedAt: Date;
        activeImages: number;
        last_created_scene: Date | null;
    }[];
}

@autoInjectable()
export default class AnalyticsRepository {
    constructor(private prisma: PrismaService) {}

    async getLatestInfo(): Promise<AnalyticsInfo[]> {
        const results = await this.prisma.user.findMany({
            select: {
                email: true,
                lastLoginAt: true,
                projects: {
                    orderBy: {
                        createdAt: 'desc'
                    },
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
                }
            }
        });

        return results.map(user => ({
            email: user.email ?? "",
            lastLoginAt: user.lastLoginAt ?? new Date(),
            projects: user.projects.map(project => ({
                id: project.id,
                title: project.title,
                createdAt: project.createdAt,
                updatedAt: project.updatedAt,
                activeImages: project._count.scenes, // This now represents active (non-deleted) scenes
                last_created_scene: project.scenes[0]?.createdAt || null
            }))
        }));
    }
}
