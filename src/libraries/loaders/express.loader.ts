import express, { Express } from "express"
import cors from 'cors'
import UserController from "../../components/user/entry-points/api/controllers/user.controller"
import { container } from "tsyringe"
import config from "../../config"
import authenticateJWT from "../auth/middlewares/jwt.middleware"
import ProjectController from "../../components/project/entry-points/api/controllers/project.controller"
import OAuthController from "../../components/user/entry-points/api/controllers/oauth.controller"
import AnalyticsController from "../../components/analytics/entry-points/api/analytics.controller"
import { responseLogger } from "../middlewares/logger.middleware"

const loadExpress = (app: Express) => {
    app.use(cors({ origin: "*" }))
    app.use(express.json())
    app.use(responseLogger())

    const userController = container.resolve(UserController)
    app.use("/users", userController.routes)

    const oAuthController = container.resolve(OAuthController)
    app.use("/oauth", oAuthController.routes)

    const projectController = container.resolve(ProjectController)
    app.use("/projects", authenticateJWT, projectController.routes)

    const analyticsController = container.resolve(AnalyticsController)
    app.use("/analytics", analyticsController.routes)

    app.listen(config.port)
}

export default loadExpress