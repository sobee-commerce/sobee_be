import { IRoute } from "@/interface"
import { Request, Response, Router } from "express"
import { HttpStatusCode, SuccessfulResponse, asyncHandler } from "@/common/utils"
import middleware from "@/common/middleware"
import { AnalyticsService } from "./analytics.service"
import { ERole } from "@/enum"

export class AnalyticsController implements IRoute {
  private readonly router: Router
  private readonly path: string

  private readonly PATHS = {
    ROOT: "/",
    SUMMARY: "/summary",
    TOTAL_ORDER_BY_STATUS: "/total-order-by-status",
    ORDER_ANALYTICS: "/order-analytics"
  }

  private static readonly analyticsService = new AnalyticsService()

  constructor(path = "/api/analytics") {
    this.router = Router()
    this.router.use(middleware.verifyToken)
    // this.router.use(middleware.verifyRoles(ERole.ADMIN))
    this.path = path
    this.initializeRoutes()
  }

  private initializeRoutes(): void {
    this.router.get(this.PATHS.SUMMARY, asyncHandler(this.summary))
    this.router.get(this.PATHS.TOTAL_ORDER_BY_STATUS, asyncHandler(this.totalOrderByStatus))
    this.router.get(this.PATHS.ORDER_ANALYTICS, asyncHandler(this.orderAnalytics))
  }

  private async summary(req: Request, res: Response): Promise<void> {
    const summary = await AnalyticsController.analyticsService.summary()
    return new SuccessfulResponse(summary, HttpStatusCode.OK, "Get summary analytics successfully").from(res)
  }

  private async totalOrderByStatus(req: Request, res: Response): Promise<void> {
    const totalOrderByStatus = await AnalyticsController.analyticsService.totalOrderByStatus({
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string
    })
    return new SuccessfulResponse(totalOrderByStatus, HttpStatusCode.OK, "Get total order by status successfully").from(
      res
    )
  }

  private async orderAnalytics(req: Request, res: Response): Promise<void> {
    const orderAnalytics = await AnalyticsController.analyticsService.orderAnalyticData(
      req.query.startDate as string,
      req.query.endDate as string
    )
    return new SuccessfulResponse(orderAnalytics, HttpStatusCode.OK, "Get order analytics successfully").from(res)
  }

  getPath(): string {
    return this.path
  }

  getRouter(): Router {
    return this.router
  }
}
