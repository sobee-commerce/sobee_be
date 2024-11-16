import { IRoute } from "@/interface"
import { TaxService } from "./tax.service"
import { Request, Response, Router } from "express"
import { HttpStatusCode, SuccessfulResponse, asyncHandler } from "@/common/utils"
import middleware from "@/common/middleware"
import { ERole } from "@/enum"
import { EActionPermissions } from "@/common/utils/rbac"

export class TaxController implements IRoute {
  private readonly router: Router
  private readonly path: string

  private readonly PATHS = {
    ROOT: "/",
    TAX: "/:taxId"
  }

  private static readonly taxService = new TaxService()

  constructor(path = "/api/tax") {
    this.router = Router()
    this.router.use(middleware.verifyToken)
    this.router.use(middleware.verifyRoles(ERole.ADMIN, ERole.STAFF))
    this.path = path
    this.initializeRoutes()
  }

  private initializeRoutes(): void {
    this.router.post(this.PATHS.ROOT, middleware.mustHaveFields("name", "rate"), asyncHandler(this.createTax))
    this.router.put(this.PATHS.TAX, asyncHandler(this.updateTax))
    this.router.get(this.PATHS.ROOT, asyncHandler(this.getAllTaxes))
    this.router.get(this.PATHS.TAX, asyncHandler(this.getTax))
    this.router.delete(this.PATHS.TAX, asyncHandler(this.deleteTax))
  }

  private async createTax(req: Request, res: Response): Promise<void> {
    const tax = await TaxController.taxService.create(req.body)

    new SuccessfulResponse(tax, HttpStatusCode.CREATED, "Tax created successfully").from(res)
  }

  private async updateTax(req: Request, res: Response): Promise<void> {
    const tax = await TaxController.taxService.update(req.params.taxId, req.body)

    new SuccessfulResponse(tax, HttpStatusCode.OK, "Tax updated successfully").from(res)
  }

  private async getAllTaxes(req: Request, res: Response): Promise<void> {
    const taxes = await TaxController.taxService.getAll()

    new SuccessfulResponse(taxes, HttpStatusCode.OK).from(res)
  }

  private async getTax(req: Request, res: Response): Promise<void> {
    const tax = await TaxController.taxService.getOne("_id", req.params.taxId)

    new SuccessfulResponse(tax, HttpStatusCode.OK).from(res)
  }

  private async deleteTax(req: Request, res: Response): Promise<void> {
    const data = await TaxController.taxService.delete(req.params.taxId)

    new SuccessfulResponse(data, HttpStatusCode.OK, "Tax deleted successfully").from(res)
  }

  getPath(): string {
    return this.path
  }

  getRouter(): Router {
    return this.router
  }
}
