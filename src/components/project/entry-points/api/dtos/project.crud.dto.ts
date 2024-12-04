import { ParamsDictionary } from "express-serve-static-core"
import { ProjectWithScenes } from "../../../data-access/project.types"
import { Request } from "express-serve-static-core"

export interface CreateProjectRequest {
    title: string,
    scenes: CreateSceneRequest[]
}

export interface UploadImagesRequest extends Request {
    files: Express.Multer.File[],
    body: {
        projectId: string
    }
}

export interface UploadImagesResponse {
    images: string[]
}

export interface CreateSceneRequest {
    description: string,
    imageUrl: string
}

export interface GetProjectParams extends ParamsDictionary {
    projectId: string
}

interface SaveProjectSceneRequest {
    id?: string,
    description: string,
    voiceOver: string,
    imageUrl: string,
    projectId: string,
    isDeleted?: boolean,
    indexInProject?: number,
    createdAt?: Date,
    updatedAt?: Date

}

export interface SaveProjectRequest {
    id: string,
    title: string,
    imageUrl: string,
    createdAt: Date,
    updatedAt: Date,
    scenes: SaveProjectSceneRequest[]
}


export interface UpdateProjectRequest {
    projectId: string,
    title?: string,
    imageUrl?: string
}

export interface DeleteRequest {
    id: string
}

export interface ProjectScenesRequest {
    projectId: string
}

export interface AddSceneRequest {
    projectId: string,
    description: string,
    voiceOver: string,
    imageUrl: string
}

export interface BatchAddSceneRequest {
    projectId: string,
    scenes: CreateSceneRequest[]
}

export interface UpdateSceneRequest {
    sceneId: string,
    description?: string,
    voiceOver?: string,
    imageUrl?: string
}