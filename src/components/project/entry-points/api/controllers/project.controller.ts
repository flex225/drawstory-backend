import { Request, Response, Router } from "express";
import { autoInjectable } from "tsyringe";
import ProjectService from "../../../domain/services/project.service";
import { ErrorResponse, ValidatedRequest } from "../../../../user/entry-points/api/dtos/userCrud.dto";
import { LightweightProject, LightweightScene, NewProject, ProjectWithScenes } from "../../../data-access/project.types";
import { AddSceneRequest, BatchAddSceneRequest, CreateProjectRequest, DeleteRequest, GetProjectParams, ProjectScenesRequest, SaveProjectRequest, UpdateProjectRequest, UpdateSceneRequest, UploadImagesRequest, UploadImagesResponse } from "../dtos/project.crud.dto";
import config from "../../../../../config";
import path from "path";
import { PutObjectCommand, PutObjectCommandInput } from "@aws-sdk/client-s3";
import s3Client from "../../../../../libraries/aws/aws.client";
import multer, { Multer } from "multer";
import { randomUUID } from "crypto";


@autoInjectable()
export default class ProjectController {
    private _router: Router
    private _upload: Multer

    constructor(private projectService: ProjectService) {
        this._router = Router()
        this._upload = multer()
        this.defineRoutes()
    }

    private defineRoutes(): void {
        this._router.post("/create", this.createProject.bind(this))
        this._router.get('/:projectId', this.getProjectById.bind(this))
        this._router.get("/", this.getProjectsByAuthor.bind(this))
        this._router.post('/save', this.saveProject.bind(this))
        this._router.post("/update", this.updateProject.bind(this))
        this._router.post("/delete", this.softDeleteProject.bind(this))
        // this._router.post("/delete", this.deleteProject.bind(this))
        this._router.post("/scenes", this.getProjectScenes.bind(this))
        this._router.post("/scenes/add", this.addScene.bind(this))
        this._router.post("/upload-images", this._upload.array("images"), this.uploadImages.bind(this))
        this._router.post("/scenes/batch-add", this.addScene.bind(this))
        // this._router.post("/scenes/update", this.updateScene.bind(this))
        this._router.post("/scenes/remove", this.removeScene.bind(this))
        // this._router.post("/comments", this.getProjectComments.bind(this))
        // this._router.post("/comments/add", this.addComment.bind(this))
        // this._router.post("/comments/delete", this.deleteComment.bind(this))
    }

    private async createProject(req: Request<{}, {}, CreateProjectRequest>, res: Response<NewProject | ErrorResponse>): Promise<void> {
        const { title, scenes, projectId } = req.body
        const userId = (req as ValidatedRequest).userId
        if (!title) {
            res.status(400).send({ message: "Title not found" })
            return
        }
        const result = await this.projectService.createProject(title, scenes, userId, projectId)
        if (result) {
            res.status(200).send(result)
        } else {
            res.status(500).send({ message: "Something went wrong" })
        }
    }

    private async getProjectById(req: Request<GetProjectParams>, res: Response<ProjectWithScenes | ErrorResponse>): Promise<void> {
        const { projectId } = req.params
        if (!projectId) {
            res.status(400).send({ message: "ID not found" })
            return
        }
        const result = await this.projectService.getProjectById(projectId)
        if (!result) {
            res.status(404).send({ message: "Project with ID not found" })
            return
        }
        res.status(200).send(result)
    }

    private async saveProject(req: Request<{}, {}, SaveProjectRequest>, res: Response<ProjectWithScenes | ErrorResponse>): Promise<void> {
        const { id } = req.body
        if (!id) {
            res.status(400).send({ message: "ID not found" })
            return
        }
        const result = await this.projectService.saveProject(req.body)
        if (!result) {
            res.status(500).send({ message: "Something went wrong" })
            return
        }
        res.status(200).send(result)
    }

    private async getProjectsByAuthor(req: Request, res: Response<LightweightProject[] | ErrorResponse>): Promise<void> {
        const userId = (req as ValidatedRequest).userId
        const result = await this.projectService.getProjectsByAuthor(userId)
        res.status(200).send(result)
    }

    private async updateProject(req: Request<{}, {}, UpdateProjectRequest>, res: Response<LightweightProject | ErrorResponse>): Promise<void> {
        const { projectId, title, imageUrl } = req.body
        if (!projectId) {
            res.status(400).send({ message: "ID not found" })
            return
        }
        const result = await this.projectService.updateProject(projectId, title, imageUrl)
        if (!result) {
            res.status(500).send({ message: "Something went wrong" })
            return
        }
        res.status(200).send(result)
    }

    private async softDeleteProject(req: Request<{}, {}, DeleteRequest>, res: Response<LightweightProject | ErrorResponse>): Promise<void> {
        const { id } = req.body
        if (!id) {
            res.status(400).send({ message: "ID not found" })
            return
        }
        const result = await this.projectService.softDeleteProject(id)
        if (!result) {
            res.status(500).send({ message: "Something went wrong" })
            return
        }
        res.status(200).send(result)
    }

    private async deleteProject(req: Request<{}, {}, DeleteRequest>, res: Response<ErrorResponse>): Promise<void> {
        const { id } = req.body
        if (!id) {
            res.status(400).send({ message: "ID not found" })
            return
        }
        const result = await this.projectService.deleteProjectPermanently(id)
        if (!result) {
            res.status(500).send({ message: "Something went wrong" })
            return
        }
        res.status(200).send()
    }

    private async getProjectScenes(req: Request<{}, {}, ProjectScenesRequest>, res: Response<LightweightScene[] | ErrorResponse>): Promise<void> {
        const { projectId } = req.body
        if (!projectId) {
            res.status(400).send({ message: "ID not found" })
            return
        }
        const result = await this.projectService.getScenesForProject(projectId)
        res.status(200).send(result)
    }

    private async addScene(req: Request<{}, {}, AddSceneRequest>, res: Response<LightweightScene | ErrorResponse>): Promise<void> {
        const { projectId, description, voiceOver, imageUrl } = req.body
        if (!projectId) {
            res.status(400).send({ message: "ID not found" })
            return
        }
        const result = await this.projectService.addSceneToProject(projectId, description, voiceOver, imageUrl)
        res.status(200).send(result)
    }

    private async uploadImages(req: Request, res: Response<UploadImagesResponse | ErrorResponse>): Promise<void> {
        const customReq = req as UploadImagesRequest
        try {
            const { projectId } = customReq.body
            if (!customReq.files || !Array.isArray(customReq.files)) {
                res.status(400).send({ message: 'No files uploaded' })
                return
            }
            let id
            if (projectId) {
                id = projectId
            } else {
                id = randomUUID()
            }
            console.log(id)
            const bucketName = config.awsConfig.bucketName
            if (bucketName.length === 0) {
                res.status(400).send({ message: 'Bucket not configured' })
                return
            }
            
            const uploadedUrls = await Promise.all(
                customReq.files.map(async (file: Express.Multer.File, index: number) => {
                    const fileExtension = path.extname(file.originalname)
                    const key = `${customReq.userId}/${id}/image_${index + 1}${fileExtension}`
                    const uploadParams: PutObjectCommandInput = {
                        Bucket: bucketName,
                        Key: key,
                        Body: file.buffer,
                        ContentType: file.mimetype
                    };

                    // Create and send the command to upload the file
                    const command = new PutObjectCommand(uploadParams);
                    await s3Client.send(command);

                    // Construct and return the URL for the uploaded file
                    return `https://${bucketName}.s3.${config.awsConfig.region}.amazonaws.com/${uploadParams.Key}`;
                })
            );

            res.status(200).send({ projectId: id, images: uploadedUrls });
        } catch (error) {
            console.error('Error uploading files to S3:', error);
            res.status(500).send({ message: 'Error uploading files' });
        }
    }

    private async batchAddScene(req: Request<{}, {}, BatchAddSceneRequest>, res: Response<LightweightScene[] | ErrorResponse>): Promise<void> {
        const { projectId, scenes } = req.body
        if (!projectId) {
            res.status(400).send({ message: "ID not found" })
            return
        }
        const result = await this.projectService.batchAddSceneToProject(projectId, scenes)
        res.status(200).send(result)
    }

    // private async updateScene(req: Request<{}, {}, UpdateSceneRequest>, res: Response<LightweightScene | ErrorResponse>): Promise<void> {
    //     const {sceneId, description, voiceOver, imageUrl} = req.body
    //     if (!sceneId) {
    //         res.status(400).send({ message: "ID not found" })
    //         return
    //     }
    //     const result = await this.projectService.updateScene(sceneId, description, voiceOver, imageUrl)
    //     if (!result) {
    //         res.status(500).send({ message: "Something went wrong" })
    //         return
    //     }
    //     res.status(200).send(result)
    //  }

    private async removeScene(req: Request<{}, {}, DeleteRequest>, res: Response<ErrorResponse>): Promise<void> {
        const { id } = req.body
        if (!id) {
            res.status(400).send({ message: "ID not found" })
            return
        }
        const result = await this.projectService.removeScene(id)
        if (!result) {
            res.status(500).send({ message: "Something went wrong" })
            return
        }
        res.status(200).send()
    }

    private async removeScenePermanently(req: Request<{}, {}, DeleteRequest>, res: Response<ErrorResponse>): Promise<void> {
        const { id } = req.body
        if (!id) {
            res.status(400).send({ message: "ID not found" })
            return
        }
        const result = await this.projectService.removeScenePermanently(id)
        if (!result) {
            res.status(500).send({ message: "Something went wrong" })
            return
        }
        res.status(200).send()
    }

    // private async getProjectComments(req: Request, res: Response): Promise<void> { }

    // private async addComment(req: Request, res: Response): Promise<void> { }

    // private async deleteComment(req: Request, res: Response): Promise<void> { }

    public get routes(): Router {
        return this._router
    }
}