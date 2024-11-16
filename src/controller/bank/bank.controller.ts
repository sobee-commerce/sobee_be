import { IPaymentAccount, IRoute } from "@/interface"
import { PaymentAccountService } from "./bank.service"
import { Request, Response, Router } from "express"
import middleware from "@/common/middleware"
import { ErrorResponse, HttpStatusCode, SuccessfulResponse, asyncHandler } from "@/common/utils"

export class PaymentAccountController implements IRoute {
  private readonly router: Router
  private readonly path: string

  private readonly PATHS = {
    ROOT: "/",
    PAYMENT_ACCOUNT: "/:id",
    CUSTOMER: "/customer",
    DEFAULT: "/set-default"
  }

  private static readonly paymentAccountService = new PaymentAccountService()

  constructor(path = "/api/payment-account") {
    this.router = Router()
    this.path = path
    this.router.use(middleware.verifyToken)
    this.initializeRoutes()
  }

  private initializeRoutes(): void {
    this.router.post(
      this.PATHS.ROOT,
      middleware.mustHaveFields<IPaymentAccount>("accountHolderName", "accountNumber", "bankName"),
      middleware.doNotAllowFields("customer"),
      asyncHandler(this.createPaymentAccount)
    )
    this.router.put(
      this.PATHS.DEFAULT,
      middleware.mustHaveFields("paymentAccountId"),
      asyncHandler(this.setDefaultPaymentAccount)
    )
    this.router.put(this.PATHS.PAYMENT_ACCOUNT, asyncHandler(this.updatePaymentAccount))
    this.router.delete(this.PATHS.PAYMENT_ACCOUNT, asyncHandler(this.deletePaymentAccount))
    this.router.get(this.PATHS.CUSTOMER, asyncHandler(this.getCustomerPaymentAccounts))
  }

  getPath(): string {
    return this.path
  }

  getRouter(): Router {
    return this.router
  }

  private async createPaymentAccount(req: Request, res: Response): Promise<void> {
    const data = await PaymentAccountController.paymentAccountService.create({ ...req.body, customer: req.userId })
    new SuccessfulResponse(data, HttpStatusCode.CREATED, "Payment account created successfully").from(res)
  }

  private async updatePaymentAccount(req: Request, res: Response): Promise<void> {
    const data = await PaymentAccountController.paymentAccountService.update(
      req.params.id,
      req.body,
      req.userId,
      req.role
    )
    new SuccessfulResponse(data, HttpStatusCode.OK, "Payment account updated successfully").from(res)
  }

  private async deletePaymentAccount(req: Request, res: Response): Promise<void> {
    const data = await PaymentAccountController.paymentAccountService.delete(req.params.id, req.userId, req.role)
    new SuccessfulResponse(data, HttpStatusCode.OK, "Payment account deleted successfully").from(res)
  }

  private async getCustomerPaymentAccounts(req: Request, res: Response): Promise<void> {
    const data = await PaymentAccountController.paymentAccountService.getCustomerPaymentAccounts(req.userId)
    new SuccessfulResponse(data, HttpStatusCode.OK).from(res)
  }

  private async setDefaultPaymentAccount(req: Request, res: Response): Promise<void> {
    const data = await PaymentAccountController.paymentAccountService.setDefaultPaymentAccount(
      req.body.paymentAccountId,
      req.userId,
      req.role
    )
    new SuccessfulResponse(data, HttpStatusCode.OK, "Payment account set as default successfully").from(res)
  }
}
