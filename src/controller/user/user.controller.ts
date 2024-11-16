import { IRoute } from "@/interface"
import { UserService } from "./user.service"
import { Request, Response, Router } from "express"
import { HttpStatusCode, SuccessfulResponse, asyncHandler } from "@/common/utils"
import middleware from "@/common/middleware"
import Multer from "multer"

export class UserController implements IRoute {
  private readonly router: Router
  private readonly path: string
  private readonly UPLOAD_FIELD_NAME = "upload_file"

  private readonly PATHS = {
    ROOT: "/",
    AVATAR: "/avatar"
  }

  private static readonly userService = new UserService()

  constructor(path = "/api/user") {
    this.router = Router()
    this.router.use(middleware.verifyToken)
    this.path = path
    this.initializeRoutes()
  }

  private initializeRoutes(): void {
    this.router.put(this.PATHS.ROOT, asyncHandler(this.updateUserInfo))
    this.router.put(this.PATHS.AVATAR, asyncHandler(this.changeUserAvatar))
  }

  private async updateUserInfo(req: Request, res: Response): Promise<void> {
    const data = await UserController.userService.updateUserInfo(req.userId, req.body)
    new SuccessfulResponse(data, HttpStatusCode.OK, "User info updated successfully").from(res)
  }

  private async changeUserAvatar(req: Request, res: Response): Promise<void> {
    const data = await UserController.userService.changeUserAvatar(req.userId, req.body.avatar)
    new SuccessfulResponse(data, HttpStatusCode.OK, "User avatar updated successfully").from(res)
  }

  getPath(): string {
    return this.path
  }

  getRouter(): Router {
    return this.router
  }
}
