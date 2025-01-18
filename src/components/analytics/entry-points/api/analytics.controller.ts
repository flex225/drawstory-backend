import { Request, Response, Router } from "express";
import { autoInjectable } from "tsyringe";
import AnalyticsService from "../../domain/services/analytics.service";

@autoInjectable()
export default class AnalyticsController {
    private _router: Router

    constructor(private analyticsService: AnalyticsService) {
        this._router = Router()
        this.defineRoutes()
    }

    private defineRoutes(): void {
        this._router.get("/user-info-latest", this.getAnalytics.bind(this))
    }

    private async getAnalytics(req: Request, res: Response): Promise<void> {
        const result = await this.analyticsService.getLatestInfoAsCsv()
        res.status(200).send(result)
    }


    public get routes(): Router {
        return this._router
    }
}
