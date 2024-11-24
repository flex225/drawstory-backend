import { autoInjectable } from "tsyringe";
import PrismaService from "../../../libraries/prisma/prisma.service";
import { Comment, Project, Scene } from "@prisma/client";
import { LightweightProject, LightweightScene, NewProject, ProjectWithScenes } from "./project.types";



@autoInjectable()
export default class ProjectRepository {
    constructor(private prisma: PrismaService) {}

    async createProject(
        title: string,
        imageUrl: string,
        authorId: string
    ): Promise<NewProject> {
        return await this.prisma.project.create({
            data: {
                title,
                imageUrl,
                authorId
            },
            select: { 
                id: true, 
                title: true, 
                createdAt: true, 
                updatedAt: true 
            },
        })
    }

    async getProjectById(projectId: string): Promise<ProjectWithScenes|null> {
        return await this.prisma.project.findUnique({
            where: {
                id: projectId,
                isDeleted: false
            },
            include: {
                scenes: true
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
                ...(imageUrl && { imageUrl })            },
        });
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

    // Delete a project permanently by ID
    async deleteProjectPermanently(projectId: string): Promise<Project | null> {
        return await this.prisma.project.delete({
            where: {
                id: projectId,
            },
        });
    }

    // Get all scenes for a specific project
    async getScenesForProject(projectId: string): Promise<LightweightScene[]> {
        return await this.prisma.scene.findMany({
            where: {
                projectId,
            },
            select: {
                id: true,
                description: true,
                voiceOver: true,
                imageUrl: true,
                createdAt: true,
                updatedAt: true
            },
        });
    }

    // Add a scene to a project
    async addSceneToProject(
        projectId: string,
        description: string,
        voiceOver: string,
        imageUrl: string
    ): Promise<LightweightScene> {
        return await this.prisma.scene.create({
            data: {
                projectId,
                description,
                voiceOver,
                imageUrl,
            },
        });
    }

    async updateScene(
        sceneId: string,
        description?: string,
        voiceOver?: string,
        imageUrl?: string
    ): Promise<LightweightScene|null> {
        return await this.prisma.scene.update({
            where: {
                id: sceneId
            },
            data: {
                ...(description && { description }),
                ...(voiceOver && { voiceOver }),
                ...(imageUrl && { imageUrl })  
            }
        })
    }

    async removeScene(sceneId: string): Promise<LightweightScene|null> {
        return await this.prisma.scene.delete({
            where: {
                id: sceneId
            }
        })
    }

    // Get all comments for a specific project
    async getCommentsForProject(projectId: string): Promise<Partial<Comment>[]> {
        return await this.prisma.comment.findMany({
            where: {
                projectId,
            },
            select: {
                id: true,
                text: true,
                author: {
                    select: {
                        id: true
                    },
                },
                createdAt: true,
            },
        });
    }
}