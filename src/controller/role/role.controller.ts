import { IRoute } from "@/interface"
import { RoleService } from "./role.service"
import { Request, Response, Router } from "express"
import { ErrorResponse, HttpStatusCode, SuccessfulResponse } from "@/common/utils"
import middleware from "@/common/middleware"
import { ERole } from "@/enum"
import { EActionPermissions, EResourcePermissions, EResourceToModel } from "@/common/utils/rbac"
import { asyncHandler } from "@/common/utils"

export class RoleController implements IRoute {
  private readonly router: Router
  private readonly path: string

  private readonly PATHS = {
    ROOT: "/",
    ROLE: "/:roleId",
    ROLE_NAME: "/roleName",
    RESOURCE: "/resource"
  }

  private static readonly roleService = new RoleService()

  constructor(path = "/api/role") {
    this.router = Router()
    this.router.use(middleware.verifyToken)
    this.router.use(middleware.verifyRoles(ERole.ADMIN))
    this.path = path
    this.initializeRoutes()
  }

  private initializeRoutes(): void {
    this.router.post(this.PATHS.ROOT, asyncHandler(this.createRole))
    this.router.put(this.PATHS.ROOT, asyncHandler(this.updateRole))
    this.router.get(this.PATHS.ROOT, asyncHandler(this.getAllRoles))
    this.router.get(this.PATHS.ROLE, asyncHandler(this.getRoleById))
    this.router.delete(
      this.PATHS.RESOURCE,
      middleware.mustHaveFields("role_name", "resources"),
      asyncHandler(this.deleteResource)
    )
    this.router.delete(this.PATHS.ROLE, asyncHandler(this.deleteRole))
  }

  private async createRole(req: Request, res: Response): Promise<void> {
    const role = await RoleController.roleService.create(req.body)
    new SuccessfulResponse(role, HttpStatusCode.CREATED, "Role created successfully").from(res)
  }
  private async updateRole(req: Request, res: Response): Promise<void> {
    const role = await RoleController.roleService.update(req.body)
    new SuccessfulResponse(role, HttpStatusCode.OK, "Role updated successfully").from(res)
  }

  private async getAllRoles(req: Request, res: Response): Promise<void> {
    const role = await RoleController.roleService.getAll()
    new SuccessfulResponse(role, HttpStatusCode.OK, "Get all role successfully").from(res)
  }

  private async getRoleById(req: Request, res: Response): Promise<void> {
    const role = await RoleController.roleService.getOne("_id", req.params.roleId)
    new SuccessfulResponse(role, HttpStatusCode.OK, "Get role by id successfully").from(res)
  }

  private async deleteRole(req: Request, res: Response): Promise<void> {
    await RoleController.roleService.delete(req.params.roleId)
    new SuccessfulResponse(null, HttpStatusCode.OK, "Role deleted successfully").from(res)
  }

  private async deleteResource(req: Request, res: Response): Promise<void> {
    const role = await RoleController.roleService.deleteResource(req.body.role_name, req.body.resources)
    new SuccessfulResponse(role, HttpStatusCode.OK, "Resources in role deleted successfully").from(res)
  }

  getPath(): string {
    return this.path
  }

  getRouter(): Router {
    return this.router
  }
}
