import { IRoute } from "@/interface"
import { Request, Response, Router } from "express"
import { HttpStatusCode, SuccessfulResponse, asyncHandler, upload } from "@/common/utils"
import middleware from "@/common/middleware"
import { UploadService } from "./upload.service"

export class UploadController implements IRoute {
  private readonly router: Router
  private readonly path: string
  private readonly UPLOAD_FIELD_NAME = "files"

  private readonly PATHS = {
    ROOT: "/",
    URL: "/url"
  }

  private static readonly uploadService = new UploadService()

  constructor(path = "/api/upload") {
    this.router = Router()
    this.router.use(middleware.verifyToken)
    this.path = path
    this.initializeRoutes()
  }

  private initializeRoutes(): void {
    this.router.post(this.PATHS.ROOT, upload.array(this.UPLOAD_FIELD_NAME), asyncHandler(this.uploadMultipleFiles))
    this.router.post(this.PATHS.URL, upload.any(), asyncHandler(this.uploadUrl))
  }

  private uploadMultipleFiles = async (req: Request, res: Response): Promise<void> => {
    const files = req.files as Express.Multer.File[]
    const { uploadPreset, folder, resourceType } = req.body
    if (!files) {
      throw new Error("Files not found")
    }
    const data = await UploadController.uploadService.uploadMultipleFiles(files, uploadPreset, folder, resourceType)

    new SuccessfulResponse(data, HttpStatusCode.OK, "Files uploaded successfully").from(res)
  }

  private uploadUrl = async (req: Request, res: Response): Promise<void> => {
    const { url, uploadPreset, folder, resourceType } = req.body
    if (!url) {
      throw new Error("URL not found")
    }
    const data = await UploadController.uploadService.uploadUrl(url, uploadPreset, folder, resourceType)

    new SuccessfulResponse(data, HttpStatusCode.OK, "File uploaded successfully").from(res)
  }

  getPath(): string {
    return this.path
  }

  getRouter(): Router {
    return this.router
  }
}
