import { ICard, IRoute } from "@/interface"
import { CardService } from "./card.service"
import { Request, Response, Router } from "express"
import middleware from "@/common/middleware"
import { ErrorResponse, HttpStatusCode, SuccessfulResponse, asyncHandler } from "@/common/utils"

export class CardController implements IRoute {
  private readonly router: Router
  private readonly path: string

  private readonly PATHS = {
    ROOT: "/",
    CARD: "/:id",
    CUSTOMER: "/customer",
    DEFAULT: "/set-default"
  }

  private static readonly cardService = new CardService()

  constructor(path = "/api/card") {
    this.router = Router()
    this.path = path
    this.router.use(middleware.verifyToken)
    this.initializeRoutes()
  }

  private initializeRoutes(): void {
    this.router.post(
      this.PATHS.ROOT,
      middleware.mustHaveFields<ICard>("cardHolderName", "cardNumber", "cvv", "expiryDate", "postalCode", "cardBrand"),
      middleware.doNotAllowFields("customer"),
      asyncHandler(this.createCard)
    )
    this.router.put(this.PATHS.DEFAULT, middleware.mustHaveFields("cardId"), asyncHandler(this.setDefaultCard))
    this.router.put(this.PATHS.CARD, asyncHandler(this.updateCard))
    this.router.delete(this.PATHS.CARD, asyncHandler(this.deleteCard))
    this.router.get(this.PATHS.CUSTOMER, asyncHandler(this.getCustomerCards))
  }

  getPath(): string {
    return this.path
  }

  getRouter(): Router {
    return this.router
  }

  private async createCard(req: Request, res: Response): Promise<void> {
    const data = await CardController.cardService.create({ ...req.body, customer: req.userId })
    new SuccessfulResponse(data, HttpStatusCode.CREATED, "Card created successfully").from(res)
  }

  private async updateCard(req: Request, res: Response): Promise<void> {
    const data = await CardController.cardService.update(req.params.id, req.body, req.userId, req.role)
    new SuccessfulResponse(data, HttpStatusCode.OK, "Card updated successfully").from(res)
  }

  private async deleteCard(req: Request, res: Response): Promise<void> {
    const data = await CardController.cardService.delete(req.params.id, req.userId, req.role)
    new SuccessfulResponse(data, HttpStatusCode.OK, "Card deleted successfully").from(res)
  }

  private async getCustomerCards(req: Request, res: Response): Promise<void> {
    const data = await CardController.cardService.getCustomerCards(req.userId)
    new SuccessfulResponse(data, HttpStatusCode.OK).from(res)
  }

  private async setDefaultCard(req: Request, res: Response): Promise<void> {
    const data = await CardController.cardService.setDefaultCard(req.body.cardId, req.userId, req.role)
    new SuccessfulResponse(data, HttpStatusCode.OK, "Card set as default successfully").from(res)
  }
}
