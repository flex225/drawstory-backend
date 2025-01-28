import { ParamsDictionary } from "express-serve-static-core"
import { ValidatedRequest } from "../../../../user/entry-points/api/dtos/userCrud.dto"

export interface CreateProjectRequest {
    title: string,
    projectId?: string,
    scenes: CreateSceneRequest[]
}

export interface UploadImagesRequest extends ValidatedRequest {
    files: Express.Multer.File[],
    body: {
        projectId?: string,
        sceneCount?: string
    }
}

export interface UploadImagesResponse {
    projectId: string,
    images: string[]
}

export interface CreateSceneRequest {
    description?: string,
    imageUrl: string,
    originalPrompt?: string
}

export interface GetProjectParams extends ParamsDictionary {
    projectId: string
}

interface SaveProjectSceneRequest {
    id?: string,
    description: string,
    voiceOver: string,
    imageUrl: string,
    originalPrompt?: string,
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

export interface RestoreProjectRequest {
    id: string
}