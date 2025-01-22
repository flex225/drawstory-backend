import { Project } from "@prisma/client";
import { autoInjectable } from "tsyringe";
import PrismaService from "../../../libraries/prisma/prisma.service";
import { CreateSceneRequest, SaveProjectRequest } from "../entry-points/api/dtos/project.crud.dto";
import { LightweightProject, LightweightScene, ProjectWithScenes } from "./project.types";



@autoInjectable()
export default class ProjectRepository {
    constructor(private prisma: PrismaService) { }

    async createProject(
        title: string,
        scenes: CreateSceneRequest[],
        authorId: string,
        projectId?: string
    ): Promise<ProjectWithScenes | null> {
        const imageUrl = scenes[0].imageUrl
        return await this.prisma.$transaction(async (prisma) => {
            let project: Project
            if (projectId) {
                project = await prisma.project.create({
                    data: {
                        id: projectId,
                        title,
                        imageUrl,
                        authorId
                    },
                })
            } else {
                project = await prisma.project.create({
                    data: {
                        title,
                        imageUrl,
                        authorId
                    },
                })
            }

            const scenePromises = scenes.map((scene, index) =>
                prisma.scene.create({
                    data: {
                        projectId: project.id,
                        description: scene.description ?? "",
                        voiceOver: "",
                        ...(scene.originalPrompt && { originalPrompt: scene.originalPrompt }),
                        indexInProject: index,
                        imageUrl: scene.imageUrl,
                    },
                })
            )

            await Promise.all(scenePromises)

            return await prisma.project.findUnique({
                where: {
                    id: project.id
                },
                include: {
                    scenes: {
                        orderBy: {
                            indexInProject: 'asc'
                        }
                    }
                }
            })

        })
    }

    async getProjectById(projectId: string): Promise<ProjectWithScenes | null> {
        return await this.prisma.project.findUnique({
            where: {
                id: projectId,
                isDeleted: false
            },
            include: {
                scenes: {
                    where: {
                        isDeleted: false
                    },
                    orderBy: {
                        indexInProject: 'asc'
                    }
                }
            }
        })
    }

    async getProjectsByAuthor(authorId: string): Promise<LightweightProject[]> {
        return await this.prisma.project.findMany({
            where: {
                authorId,
                isDeleted: false
            },
            select: {
                id: true,
                title: true,
                imageUrl: true,
                isDeleted: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }

    // Update a project by ID
    async updateProject(
        projectId: string,
        title?: string,
        imageUrl?: string
    ): Promise<LightweightProject | null> {
        return await this.prisma.project.update({
            where: {
                id: projectId,
            },
            data: {
                ...(title && { title }),
                ...(imageUrl && { imageUrl })
            },
        });
    }

    async saveProject(
        updatedProject: SaveProjectRequest
    ) {
        return await this.prisma.$transaction<ProjectWithScenes | null>(async () => {
            await this.updateProject(updatedProject.id, updatedProject.title, updatedProject.imageUrl)

            const scenePromises = updatedProject.scenes.map((scene, index) => {
                if (scene.id) {
                    return this.updateScene(index, scene.id, scene.description, scene.voiceOver, scene.imageUrl, scene.isDeleted, scene.originalPrompt)
                } else {
                    return this.addSceneToProject(updatedProject.id, scene.description, "", scene.imageUrl, index, scene.originalPrompt)
                }
            })

            await Promise.all(scenePromises)
            return await this.getProjectById(updatedProject.id)
        })

    }

    // Soft delete a project by ID
    async softDeleteProject(projectId: string): Promise<LightweightProject | null> {
        return await this.prisma.project.update({
            where: {
                id: projectId,
            },
            data: {
                isDeleted: true,
            },
        });
    }

    // // Delete a project permanently by ID
    // async deleteProjectPermanently(projectId: string): Promise<Project | null> {
    //     return await this.prisma.project.delete({
    //         where: {
    //             id: projectId,
    //         },
    //     });
    // }

    // Get all scenes for a specific project
    async getScenesForProject(projectId: string): Promise<LightweightScene[]> {
        return await this.prisma.scene.findMany({
            where: {
                projectId,
                isDeleted: false
            },
            select: {
                id: true,
                indexInProject: true,
                description: true,
                voiceOver: true,
                imageUrl: true,
                createdAt: true,
                updatedAt: true
            },
        });
    }

    async getProjectSceneCount(projectId: string): Promise<number> {
        return await this.prisma.scene.count({
            where: {
                projectId: projectId,
                isDeleted: false
            }
        })
    }

    // Add a scene to a project
    async addSceneToProject(
        projectId: string,
        description: string,
        voiceOver: string,
        imageUrl: string,
        index?: number,
        originalPrompt?: string
    ): Promise<LightweightScene> {
        const addIndex = index ?? await this.getProjectSceneCount(projectId)
        return await this.prisma.scene.create({
            data: {
                projectId,
                description,
                voiceOver,
                imageUrl,
                indexInProject: addIndex,
                ...(originalPrompt && { originalPrompt })
            },
        });
    }

    // async batchAddSceneToProject(
    //     projectId: string,
    //     scenes: CreateSceneRequest[]
    // ): Promise<LightweightScene[]> {
    //     const sceneCount = await this.getProjectSceneCount(projectId)
    //     const scenePromises = scenes.map((scene, index) =>
    //         this.prisma.scene.create({
    //             data: {
    //                 projectId: projectId,
    //                 description: scene.description,
    //                 voiceOver: "",
    //                 imageUrl: scene.imageUrl,
    //                 indexInProject: sceneCount + index
    //             },
    //         })
    //     )

    //     return await Promise.all(scenePromises)
    // }

    async updateScene(
        index: number,
        sceneId: string,
        description?: string,
        voiceOver?: string,
        imageUrl?: string,
        isDeleted?: boolean,
        originalPrompt?: string
    ): Promise<LightweightScene | null> {
        return await this.prisma.scene.update({
            where: {
                id: sceneId
            },
            data: {
                indexInProject: index,
                description: description ?? "",
                voiceOver: voiceOver ?? "",
                imageUrl: imageUrl ?? "",
                isDeleted: isDeleted ?? false,
                ...(originalPrompt && { originalPrompt })
            }
        })
    }

    async removeScene(sceneId: string): Promise<LightweightScene | null> {
        return await this.prisma.scene.update({
            where: {
                id: sceneId
            },
            data: {
                isDeleted: true
            }
        })
    }

    // async removeScenePermanently(sceneId: string): Promise<LightweightScene | null> {
    //     return await this.prisma.scene.delete({
    //         where: {
    //             id: sceneId
    //         }
    //     })
    // }

    // // Get all comments for a specific project
    // async getCommentsForProject(projectId: string): Promise<Partial<Comment>[]> {
    //     return await this.prisma.comment.findMany({
    //         where: {
    //             projectId,
    //         },
    //         select: {
    //             id: true,
    //             text: true,
    //             author: {
    //                 select: {
    //                     id: true
    //                 },
    //             },
    //             createdAt: true,
    //         },
    //     });
    // }

    async getArchivedProjectsByAuthor(authorId: string): Promise<LightweightProject[]> {
        return await this.prisma.project.findMany({
            where: {
                authorId,
                isDeleted: true
            },
            select: {
                id: true,
                title: true,
                imageUrl: true,
                isDeleted: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }

    async restoreProject(projectId: string): Promise<LightweightProject | null> {
        return await this.prisma.project.update({
            where: {
                id: projectId,
            },
            data: {
                isDeleted: false,
            }
        });
    }
}