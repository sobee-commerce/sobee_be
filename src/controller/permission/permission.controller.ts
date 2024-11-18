import { IRoute } from "@/interface"
import { PermissionService } from "./permission.service"
import { Router } from "express"

export class PermissionController implements IRoute {
  private readonly router: Router
  private readonly path: string

  private readonly PATHS = {}

  private static readonly permissionService = new PermissionService()

  constructor(path = "/api/permission") {
    this.router = Router()
    this.path = path
    this.initializeRoutes()
  }

  private initializeRoutes(): void {}

  getPath(): string {
    return this.path
  }

  getRouter(): Router {
    return this.router
  }
}
