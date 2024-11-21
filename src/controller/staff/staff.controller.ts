import { IRoute, IUser } from "@/interface"
import { StaffService } from "./staff.service"
import { Request, Response, Router } from "express"
import { ErrorResponse, HttpStatusCode, SuccessfulResponse } from "@/common/utils"
import middleware from "@/common/middleware"
import { asyncHandler } from "@/common/utils"

export class StaffController implements IRoute {
  private readonly router: Router
  private readonly path: string

  private readonly PATHS = {
    ROOT: "/",
    STAFF: "/:staffId"
  }

  private static readonly staffService = new StaffService()

  constructor(path = "/api/staff") {
    this.router = Router()
    this.router.use(middleware.verifyToken)
    this.path = path
    this.initializeRoutes()
  }

  private initializeRoutes(): void {
    this.router.post(this.PATHS.ROOT, asyncHandler(this.createStaff))
    this.router.put(this.PATHS.STAFF, asyncHandler(this.updateStaff))
    this.router.get(this.PATHS.ROOT, asyncHandler(this.getAllStaff))
    this.router.get(this.PATHS.STAFF, asyncHandler(this.getStaff))
    this.router.delete(this.PATHS.STAFF, asyncHandler(this.deleteStaff))
  }

  private async createStaff(req: Request, res: Response): Promise<void> {
    const result = await StaffController.staffService.create(req.body)
    new SuccessfulResponse(result, HttpStatusCode.CREATED, "Staff created successfully.").from(res)
  }

  private async updateStaff(req: Request, res: Response): Promise<void> {
    const result = await StaffController.staffService.update(req.params.staffId, req.body)
    new SuccessfulResponse(result, HttpStatusCode.OK, "Staff updated successfully.").from(res)
  }

  private async deleteStaff(req: Request, res: Response): Promise<void> {
    const result = await StaffController.staffService.delete(req.params.staffId)
    new SuccessfulResponse(result, HttpStatusCode.OK, "Staff deleted successfully.").from(res)
  }

  private async getAllStaff(req: Request, res: Response): Promise<void> {
    const result = await StaffController.staffService.getAll()
    new SuccessfulResponse(result, HttpStatusCode.OK).from(res)
  }

  private async getStaff(req: Request, res: Response): Promise<void> {
    const result = await StaffController.staffService.getOne("_id", req.params.staffId)
    new SuccessfulResponse(result, HttpStatusCode.OK).from(res)
  }

  getPath(): string {
    return this.path
  }

  getRouter(): Router {
    return this.router
  }
}
