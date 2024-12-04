import { autoInjectable } from "tsyringe";
import ProjectRepository from "../../data-access/project.repository";
import { Project, Scene, Comment } from "@prisma/client";
import { CreateSceneRequest, SaveProjectRequest } from "../../entry-points/api/dtos/project.crud.dto";
import { ProjectWithScenes } from "../../data-access/project.types";



@autoInjectable()
export default class ProjectService {
    constructor(private projectRepository: ProjectRepository) { }

    async createProject(
        title: string,
        scenes: CreateSceneRequest[],
        authorId: string
    ) {
        return await this.projectRepository.createProject(title, scenes, authorId)
    }

    async getProjectById(projectId: string) {
        return await this.projectRepository.getProjectById(projectId)
    }

    async getProjectsByAuthor(authorId: string) {
        return await this.projectRepository.getProjectsByAuthor(authorId)
    }

    // Update a project by ID
    async updateProject(
        projectId: string,
        title?: string,
        imageUrl?: string
    ) {
        return await this.projectRepository.updateProject(projectId, title, imageUrl)
    }

    async saveProject(updatedProject: SaveProjectRequest) {
        return await this.projectRepository.saveProject(updatedProject)
    }

    // Soft delete a project by ID
    async softDeleteProject(projectId: string) {
        return await this.projectRepository.softDeleteProject(projectId)
    }

    // Delete a project permanently by ID
    async deleteProjectPermanently(projectId: string) {
        return await this.projectRepository.deleteProjectPermanently(projectId)
    }

    // Get all scenes for a specific project
    async getScenesForProject(projectId: string) {
        return await this.projectRepository.getScenesForProject(projectId)
    }

    // Add a scene to a project
    async addSceneToProject(
        projectId: string,
        description: string,
        voiceOver: string,
        imageUrl: string
    ) {
        return await this.projectRepository.addSceneToProject(projectId, description, voiceOver, imageUrl)
    }

    async batchAddSceneToProject(
        projectId: string,
        scenes: CreateSceneRequest[]
    ) {
        return await this.projectRepository.batchAddSceneToProject(projectId, scenes)
    }

    // async updateScene(
    //     sceneId: string,
    //     description?: string,
    //     voiceOver?: string,
    //     imageUrl?: string
    // ) {
    //     return await this.projectRepository.updateScene(sceneId, description, voiceOver, imageUrl)
    // }

    async removeScene(sceneId: string) {
        return await this.projectRepository.removeScene(sceneId)
    }

    async removeScenePermanently(sceneId: string) {
        return await this.projectRepository.removeScenePermanently(sceneId)
    }

    // Get all comments for a specific project
    async getCommentsForProject(projectId: string) {
        return await this.projectRepository.getCommentsForProject(projectId)
    }
}