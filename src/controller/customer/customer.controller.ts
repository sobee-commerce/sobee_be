import { IRoute } from "@/interface"
import { CustomerService } from "./customer.service"
import { Request, Response, Router } from "express"
import { HttpStatusCode, SuccessfulResponse, asyncHandler } from "@/common/utils"
import middleware from "@/common/middleware"
import { ERole } from "@/enum"

export class CustomerController implements IRoute {
  private readonly router: Router
  private readonly path: string

  private readonly PATHS = {
    ROOT: "/",
    ID: "/:id",
    BAN: "/ban/:id",
    UNBAN: "/unban/:id",
    CUSTOMER_ADDRESS: "/customer-address"
  }

  private static readonly customerService = new CustomerService()

  constructor(path = "/api/customer") {
    this.router = Router()
    this.path = path
    this.router.use(middleware.verifyToken)
    this.router.use(middleware.verifyRoles(ERole.ADMIN))
    this.initializeRoutes()
  }

  private initializeRoutes(): void {
    this.router.post(this.PATHS.ROOT, asyncHandler(this.create))
    this.router.get(this.PATHS.ROOT, asyncHandler(this.getAll))
    this.router.delete(this.PATHS.ROOT, asyncHandler(this.deleteAll))
    this.router.get(this.PATHS.CUSTOMER_ADDRESS, asyncHandler(this.getCustomerAndAddress))
    this.router.get(this.PATHS.ID, asyncHandler(this.getById))
    this.router.put(this.PATHS.BAN, asyncHandler(this.banCustomer))
    this.router.put(this.PATHS.UNBAN, asyncHandler(this.unbanCustomer))
    this.router.put(this.PATHS.ID, asyncHandler(this.update))
    this.router.delete(this.PATHS.ID, asyncHandler(this.delete))
  }

  async create(req: Request, res: Response): Promise<void> {
    const data = await CustomerController.customerService.create(req.body)
    return new SuccessfulResponse(data, HttpStatusCode.CREATED, "Create customer successfully").from(res)
  }

  async getAll(req: Request, res: Response): Promise<void> {
    const data = await CustomerController.customerService.getAll()
    return new SuccessfulResponse(data, HttpStatusCode.OK, "Get all customers successfully").from(res)
  }

  async getById(req: Request, res: Response): Promise<void> {
    const data = await CustomerController.customerService.getById(req.params.id)
    return new SuccessfulResponse(data, HttpStatusCode.OK, "Get customer by id successfully").from(res)
  }

  async banCustomer(req: Request, res: Response): Promise<void> {
    const data = await CustomerController.customerService.banCustomer(req.params.id)
    return new SuccessfulResponse(data, HttpStatusCode.OK, "Ban customer successfully").from(res)
  }

  async unbanCustomer(req: Request, res: Response): Promise<void> {
    const data = await CustomerController.customerService.unbanCustomer(req.params.id)
    return new SuccessfulResponse(data, HttpStatusCode.OK, "Unban customer successfully").from(res)
  }

  async update(req: Request, res: Response): Promise<void> {
    const data = await CustomerController.customerService.update(req.params.id, req.body)
    return new SuccessfulResponse(data, HttpStatusCode.OK, "Update customer successfully").from(res)
  }

  async delete(req: Request, res: Response): Promise<void> {
    const data = await CustomerController.customerService.delete(req.params.id)
    return new SuccessfulResponse(data, HttpStatusCode.OK, "Delete customer successfully").from(res)
  }

  async deleteAll(req: Request, res: Response): Promise<void> {
    const data = await CustomerController.customerService.deleteAll()
    return new SuccessfulResponse(data, HttpStatusCode.OK, "Delete all customers successfully").from(res)
  }

  async getCustomerAndAddress(req: Request, res: Response): Promise<void> {
    const data = await CustomerController.customerService.getCustomersAndAdresses()
    return new SuccessfulResponse(data, HttpStatusCode.OK, "Get customer and address successfully").from(res)
  }

  getPath(): string {
    return this.path
  }

  getRouter(): Router {
    return this.router
  }
}
