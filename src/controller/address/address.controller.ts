import { IAddress, IRoute } from "@/interface"
import { AddressService } from "./address.service"
import { Request, Response, Router } from "express"
import middleware from "@/common/middleware"
import { ErrorResponse, HttpStatusCode, SuccessfulResponse, asyncHandler } from "@/common/utils"
import { ERole } from "@/enum"

export class AddressController implements IRoute {
  private readonly router: Router
  private readonly path: string

  private readonly PATHS = {
    ROOT: "/",
    ADDRESS: "/:id",
    CUSTOMER: "/customer",
    DEFAULT: "/set-default",
    MOCK: "/mock"
  }

  private static readonly addressService = new AddressService()

  constructor(path = "/api/address") {
    this.router = Router()
    this.path = path
    this.router.use(middleware.verifyToken)
    this.initializeRoutes()
  }

  private initializeRoutes(): void {
    this.router.post(
      this.PATHS.ROOT,
      middleware.mustHaveFields<IAddress>(
        "country",
        "city",
        "district",
        "ward",
        "specificAddress",
        "isDefault",
        "name",
        "phoneNumber"
      ),
      middleware.doNotAllowFields<IAddress>("customer"),
      asyncHandler(this.createAddress)
    )
    this.router.post(this.PATHS.MOCK, middleware.verifyRoles(ERole.ADMIN), asyncHandler(this.createAddressMock))
    this.router.put(this.PATHS.DEFAULT, middleware.mustHaveFields("addressId"), asyncHandler(this.setDefaultAddress))
    this.router.put(this.PATHS.ADDRESS, asyncHandler(this.updateAddress))
    this.router.delete(this.PATHS.ADDRESS, asyncHandler(this.deleteAddress))
    this.router.get(this.PATHS.CUSTOMER, asyncHandler(this.getCustomerAddresses))
  }

  getPath(): string {
    return this.path
  }

  getRouter(): Router {
    return this.router
  }

  private async createAddress(req: Request, res: Response): Promise<void> {
    const data = await AddressController.addressService.create({
      ...req.body,
      customer: req.userId
    })
    new SuccessfulResponse(data, HttpStatusCode.CREATED, "Address created successfully").from(res)
  }

  private async createAddressMock(req: Request, res: Response): Promise<void> {
    const data = await AddressController.addressService.create({
      ...req.body,
      customer: req.body.customer || req.userId
    })
    new SuccessfulResponse(data, HttpStatusCode.CREATED, "Address created successfully").from(res)
  }

  private async updateAddress(req: Request, res: Response): Promise<void> {
    const data = await AddressController.addressService.update(req.params.id, req.body, req.userId, req.role)
    new SuccessfulResponse(data, HttpStatusCode.OK, "Address updated successfully").from(res)
  }

  private async deleteAddress(req: Request, res: Response): Promise<void> {
    const data = await AddressController.addressService.delete(req.params.id, req.userId, req.role)
    new SuccessfulResponse(data, HttpStatusCode.OK, "Address deleted successfully").from(res)
  }

  private async getCustomerAddresses(req: Request, res: Response): Promise<void> {
    const data = await AddressController.addressService.getCustomerAddresses(req.userId)
    new SuccessfulResponse(data, HttpStatusCode.OK).from(res)
  }

  private async setDefaultAddress(req: Request, res: Response): Promise<void> {
    const data = await AddressController.addressService.setDefaultAddress(req.body.addressId, req.userId, req.role)
    new SuccessfulResponse(data, HttpStatusCode.OK, "Address set as default successfully").from(res)
  }
}
