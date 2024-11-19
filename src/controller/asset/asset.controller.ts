import { IAsset, IRoute } from "@/interface"
import { AssetService } from "./asset.service"
import { Request, Response, Router } from "express"
import { ErrorResponse, HttpStatusCode, SuccessfulResponse, asyncHandler } from "@/common/utils"
import middleware from "@/common/middleware"
import { ERole } from "@/enum"

export class AssetController implements IRoute {
  private readonly router: Router
  private readonly path: string

  private readonly PATHS = {
    ROOT: "/",
    ASSET: "/:assetId",
    TYPE: "/type"
  }

  private static readonly assetService = new AssetService()

  constructor(path = "/api/asset") {
    this.router = Router()
    this.path = path
    this.router.use(middleware.verifyToken)
    this.router.use(middleware.verifyRoles(ERole.ADMIN, ERole.STAFF))
    this.initializeRoutes()
  }

  private initializeRoutes(): void {
    this.router.put(this.PATHS.ASSET, asyncHandler(this.updateAsset))
    this.router.delete(this.PATHS.ASSET, asyncHandler(this.deleteAsset))
    this.router.get(this.PATHS.ROOT, asyncHandler(this.getAllAsset))
    this.router.get(this.PATHS.TYPE, middleware.verifyQuery("type", "folder"), asyncHandler(this.getByType))
    this.router.get(this.PATHS.ASSET, asyncHandler(this.getAsset))
  }

  private async updateAsset(req: Request, res: Response) {
    const asset = await AssetController.assetService.update(req.params.assetId, req.body)
    new SuccessfulResponse(asset, HttpStatusCode.OK, "Asset updated succesfully!").from(res)
  }

  private async deleteAsset(req: Request, res: Response) {
    const asset = await AssetController.assetService.delete(req.params.assetId)
    new SuccessfulResponse(asset, HttpStatusCode.OK, "Asset deleted succesfully!").from(res)
  }

  private async getAllAsset(req: Request, res: Response) {
    const assets = await AssetController.assetService.getAll()
    new SuccessfulResponse(assets, HttpStatusCode.OK, "Asset retrieved succesfully!").from(res)
  }

  private async getByType(req: Request, res: Response) {
    const assets = await AssetController.assetService.getByType(req.query.type as string, req.query.folder as string)
    new SuccessfulResponse(assets, HttpStatusCode.OK, "Asset retrieved succesfully!").from(res)
  }

  private async getAsset(req: Request, res: Response) {
    const asset = await AssetController.assetService.getOne("_id", req.params.assetId)
    new SuccessfulResponse(asset, HttpStatusCode.OK, "Asset retrieved succesfully!").from(res)
  }

  getPath(): string {
    return this.path
  }

  getRouter(): Router {
    return this.router
  }
}
