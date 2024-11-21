import { IRoute } from "@/interface"
import { ShippingService } from "./shipping.service"
import { Request, Response, Router } from "express"
import { HttpStatusCode, SuccessfulResponse, asyncHandler } from "@/common/utils"
import middleware from "@/common/middleware"
import { ERole } from "@/enum"
import { EActionPermissions } from "@/common/utils/rbac"

export class ShippingController implements IRoute {
  private readonly router: Router
  private readonly path: string

  private readonly PATHS = {
    ROOT: "/",
    SHIPPING: "/:shippingId"
  }

  private static readonly shippingService = new ShippingService()

  constructor(path = "/api/shipping") {
    this.router = Router()
    this.router.use(middleware.verifyToken)
    this.router.use(middleware.verifyRoles(ERole.ADMIN, ERole.STAFF))
    this.path = path
    this.initializeRoutes()
  }

  private initializeRoutes(): void {
    this.router.post(this.PATHS.ROOT, middleware.mustHaveFields("name", "amount"), asyncHandler(this.createShipping))
    this.router.put(this.PATHS.SHIPPING, asyncHandler(this.updateShipping))
    this.router.get(this.PATHS.ROOT, asyncHandler(this.getAllShippinges))
    this.router.get(this.PATHS.SHIPPING, asyncHandler(this.getShipping))
    this.router.delete(this.PATHS.SHIPPING, asyncHandler(this.deleteShipping))
  }

  private async createShipping(req: Request, res: Response): Promise<void> {
    const shipping = await ShippingController.shippingService.create(req.body)

    new SuccessfulResponse(shipping, HttpStatusCode.CREATED, "Shipping created successfully").from(res)
  }

  private async updateShipping(req: Request, res: Response): Promise<void> {
    const shipping = await ShippingController.shippingService.update(req.params.shippingId, req.body)

    new SuccessfulResponse(shipping, HttpStatusCode.OK, "Shipping updated successfully").from(res)
  }

  private async getAllShippinges(req: Request, res: Response): Promise<void> {
    const shippinges = await ShippingController.shippingService.getAll()

    new SuccessfulResponse(shippinges, HttpStatusCode.OK).from(res)
  }

  private async getShipping(req: Request, res: Response): Promise<void> {
    const shipping = await ShippingController.shippingService.getOne("_id", req.params.shippingId)

    new SuccessfulResponse(shipping, HttpStatusCode.OK).from(res)
  }

  private async deleteShipping(req: Request, res: Response): Promise<void> {
    const data = await ShippingController.shippingService.delete(req.params.shippingId)

    new SuccessfulResponse(data, HttpStatusCode.OK, "Shipping deleted successfully").from(res)
  }

  getPath(): string {
    return this.path
  }

  getRouter(): Router {
    return this.router
  }
}
