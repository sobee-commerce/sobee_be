import { IFavorite, IRoute } from "@/interface"
import { FavoriteService } from "./favorite.service"
import { Request, Response, Router } from "express"
import middleware from "@/common/middleware"
import { HttpStatusCode, SuccessfulResponse, asyncHandler } from "@/common/utils"

export class FavoriteController implements IRoute {
  private readonly router: Router
  private readonly path: string

  private readonly PATHS = {
    ROOT: "/",
    FAVORITE: "/:favoriteId",
    TOGGLE: "/:productId/toggle",
    REMOVE_ALL: "/clear"
  }

  private static readonly favoriteService = new FavoriteService()

  constructor(path = "/api/favorite") {
    this.router = Router()
    this.path = path
    this.router.use(middleware.verifyToken)
    this.initializeRoutes()
  }

  private initializeRoutes(): void {
    this.router.get(this.PATHS.ROOT, asyncHandler(this.getFavorites))
    this.router.put(this.PATHS.TOGGLE, asyncHandler(this.toggleFavorite))
    this.router.delete(this.PATHS.REMOVE_ALL, asyncHandler(this.removeAllFavoriteProducts))
  }

  async toggleFavorite(req: Request, res: Response): Promise<void> {
    const favorite = await FavoriteController.favoriteService.toogleFavoriteProduct(req.userId, req.params.productId)
    return new SuccessfulResponse(favorite, HttpStatusCode.OK, "Favorite updated successfully").from(res)
  }

  async getFavorites(req: Request, res: Response): Promise<void> {
    const favorite = await FavoriteController.favoriteService.getFavorites(req.userId)
    return new SuccessfulResponse(favorite, HttpStatusCode.OK, "Get favorite list successfully").from(res)
  }

  async removeAllFavoriteProducts(req: Request, res: Response): Promise<void> {
    const favorite = await FavoriteController.favoriteService.removeAllFavoriteProducts(req.userId)
    return new SuccessfulResponse(favorite, HttpStatusCode.OK, "Get favorite list successfully").from(res)
  }

  getPath(): string {
    return this.path
  }

  getRouter(): Router {
    return this.router
  }
}
