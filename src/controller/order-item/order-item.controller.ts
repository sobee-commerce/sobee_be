import { IRoute } from "@/interface"
import { OrderItemService } from "./order-item.service"
import { Router } from "express"

export class OrderItemController implements IRoute {
  private readonly router: Router
  private readonly path: string

  private readonly PATHS = {}

  private static readonly orderItemService = new OrderItemService()

  constructor(path = "/api/order-item") {
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
