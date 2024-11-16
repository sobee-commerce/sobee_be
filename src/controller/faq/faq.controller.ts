import { IFaq, IRoute } from "@/interface"
import { FaqService } from "./faq.service"
import { Request, Response, Router } from "express"
import middleware from "@/common/middleware"
import { HttpStatusCode, SuccessfulResponse, asyncHandler } from "@/common/utils"
import { ERole } from "@/enum"

export class FaqController implements IRoute {
  private readonly router: Router
  private readonly path: string

  private readonly PATHS = {
    ROOT: "/",
    FAQ: "/:faqId"
  }

  private static readonly faqService = new FaqService()

  constructor(path = "/api/faq") {
    this.router = Router()
    this.path = path
    this.initializeRoutes()
  }

  private initializeRoutes(): void {
    this.router.post(
      this.PATHS.ROOT,
      middleware.mustHaveFields<IFaq>("title", "description", "type"),
      middleware.doNotAllowFields<IFaq>("issued_by", "slug"),
      middleware.verifyToken,
      middleware.verifyRoles(ERole.ADMIN, ERole.STAFF),
      asyncHandler(this.create)
    )
    this.router.put(
      this.PATHS.FAQ,
      middleware.doNotAllowFields<IFaq>("issued_by", "slug"),
      middleware.verifyToken,
      middleware.verifyRoles(ERole.ADMIN, ERole.STAFF),
      asyncHandler(this.update)
    )
    this.router.delete(
      this.PATHS.FAQ,
      middleware.verifyToken,
      middleware.verifyRoles(ERole.ADMIN, ERole.STAFF),
      asyncHandler(this.delete)
    )
    this.router.get(this.PATHS.ROOT, asyncHandler(this.getAll))
    this.router.get(
      this.PATHS.FAQ,
      middleware.verifyToken,
      middleware.verifyRoles(ERole.ADMIN, ERole.STAFF),
      asyncHandler(this.getById)
    )
  }

  async create(req: Request, res: Response): Promise<void> {
    const data = await FaqController.faqService.create({ ...req.body, issued_by: req.userId })
    return new SuccessfulResponse(data, HttpStatusCode.CREATED, "FAQ created successfully").from(res)
  }

  async update(req: Request, res: Response): Promise<void> {
    const data = await FaqController.faqService.update(req.params.faqId, req.body)
    return new SuccessfulResponse(data, HttpStatusCode.OK, "FAQ updated successfully").from(res)
  }

  async delete(req: Request, res: Response): Promise<void> {
    const data = await FaqController.faqService.delete(req.params.faqId)
    return new SuccessfulResponse(data, HttpStatusCode.OK, "FAQ deleted successfully").from(res)
  }

  async getAll(req: Request, res: Response): Promise<void> {
    const data = await FaqController.faqService.getAll()
    return new SuccessfulResponse(data, HttpStatusCode.OK).from(res)
  }

  async getById(req: Request, res: Response): Promise<void> {
    const data = await FaqController.faqService.getById(req.params.faqId)
    return new SuccessfulResponse(data, HttpStatusCode.OK).from(res)
  }

  getPath(): string {
    return this.path
  }

  getRouter(): Router {
    return this.router
  }
}
