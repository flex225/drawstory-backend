import { ParamsDictionary } from "express-serve-static-core"

export interface CreateProjectRequest {
    title: string,
    imageUrl: string
}

export interface GetProjectParams extends ParamsDictionary {
    userId: string
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

export interface UpdateSceneRequest {
    sceneId: string,
    description?: string,
    voiceOver?: string,
    imageUrl?: string
}