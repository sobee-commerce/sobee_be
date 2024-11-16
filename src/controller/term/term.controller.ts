import { ITerm, IRoute } from "@/interface"
import { TermService } from "./term.service"
import { Request, Response, Router } from "express"
import middleware from "@/common/middleware"
import { HttpStatusCode, SuccessfulResponse, asyncHandler } from "@/common/utils"
import { ERole } from "@/enum"

export class TermController implements IRoute {
  private readonly router: Router
  private readonly path: string

  private readonly PATHS = {
    ROOT: "/",
    TERM: "/:termId"
  }

  private static readonly termService = new TermService()

  constructor(path = "/api/term") {
    this.router = Router()
    this.path = path
    this.initializeRoutes()
  }

  private initializeRoutes(): void {
    this.router.post(
      this.PATHS.ROOT,
      middleware.mustHaveFields<ITerm>("title", "description", "type"),
      middleware.doNotAllowFields<ITerm>("issued_by", "slug"),
      middleware.verifyToken,
      middleware.verifyRoles(ERole.ADMIN, ERole.STAFF),
      asyncHandler(this.create)
    )
    this.router.put(
      this.PATHS.TERM,
      middleware.doNotAllowFields<ITerm>("issued_by", "slug"),
      middleware.verifyToken,
      middleware.verifyRoles(ERole.ADMIN, ERole.STAFF),
      asyncHandler(this.update)
    )
    this.router.delete(
      this.PATHS.TERM,
      middleware.verifyToken,
      middleware.verifyRoles(ERole.ADMIN, ERole.STAFF),
      asyncHandler(this.delete)
    )
    this.router.get(this.PATHS.ROOT, asyncHandler(this.getAll))
    this.router.get(
      this.PATHS.TERM,
      middleware.verifyToken,
      middleware.verifyRoles(ERole.ADMIN, ERole.STAFF),
      asyncHandler(this.getById)
    )
  }

  async create(req: Request, res: Response): Promise<void> {
    const data = await TermController.termService.create({ ...req.body, issued_by: req.userId })
    return new SuccessfulResponse(data, HttpStatusCode.CREATED, "Term created successfully").from(res)
  }

  async update(req: Request, res: Response): Promise<void> {
    const data = await TermController.termService.update(req.params.termId, { ...req.body, issued_by: req.userId })
    return new SuccessfulResponse(data, HttpStatusCode.OK, "Term updated successfully").from(res)
  }

  async delete(req: Request, res: Response): Promise<void> {
    const data = await TermController.termService.delete(req.params.termId)
    return new SuccessfulResponse(data, HttpStatusCode.OK, "Term deleted successfully").from(res)
  }

  async getAll(req: Request, res: Response): Promise<void> {
    const data = await TermController.termService.getAll()
    return new SuccessfulResponse(data, HttpStatusCode.OK, "Get all terms successfully").from(res)
  }

  async getById(req: Request, res: Response): Promise<void> {
    const data = await TermController.termService.getById(req.params.termId)
    return new SuccessfulResponse(data, HttpStatusCode.OK).from(res)
  }

  getPath(): string {
    return this.path
  }

  getRouter(): Router {
    return this.router
  }
}
