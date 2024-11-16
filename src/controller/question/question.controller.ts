import { IQuestion, IReply, IRoute } from "@/interface"
import { QuestionService } from "./question.service"
import { Request, Response, Router } from "express"
import { HttpStatusCode, SuccessfulResponse, asyncHandler } from "@/common/utils"
import middleware from "@/common/middleware"
import { ERole } from "@/enum"

export class QuestionController implements IRoute {
  private readonly router: Router
  private readonly path: string

  private readonly PATHS = {
    ROOT: "/",
    QUESTION: "/:questionId",
    PRODUCT: "/product/:productId",
    CUSTOMER: "/customer/:customerId",
    LIKE: "/:questionId/like",
    REPLY: "/:questionId/reply",
    LIKE_REPLY: "/:questionId/like-reply"
  }

  private static readonly questionService = new QuestionService()

  constructor(path = "/api/question") {
    this.router = Router()
    this.path = path
    this.initializeRoutes()
  }

  private initializeRoutes(): void {
    this.router.post(
      this.PATHS.ROOT,
      middleware.verifyToken,
      middleware.mustHaveFields<IQuestion>("content", "product"),
      asyncHandler(this.createQuestion)
    )
    this.router.put(this.PATHS.QUESTION, middleware.verifyToken, asyncHandler(this.updateQuestion))
    this.router.get(
      this.PATHS.ROOT,
      middleware.verifyToken,
      middleware.verifyRoles(ERole.ADMIN, ERole.STAFF),
      asyncHandler(this.getAllQuestions)
    )
    this.router.delete(this.PATHS.QUESTION, middleware.verifyToken, asyncHandler(this.deleteQuestion))

    this.router.get(this.PATHS.PRODUCT, asyncHandler(this.getProductQuestions))

    this.router.get(this.PATHS.CUSTOMER, middleware.verifyToken, asyncHandler(this.getCustomerQuestions))

    this.router.put(this.PATHS.LIKE, middleware.verifyToken, asyncHandler(this.likeQuestion))

    this.router.put(
      this.PATHS.REPLY,
      middleware.verifyToken,
      middleware.mustHaveFields<IReply>("content"),
      asyncHandler(this.replyQuestion)
    )

    this.router.put(this.PATHS.LIKE_REPLY, middleware.verifyToken, asyncHandler(this.likeReply))
  }

  private async createQuestion(req: Request, res: Response): Promise<void> {
    const question = await QuestionController.questionService.create({
      ...req.body,
      customer: req.userId
    })

    new SuccessfulResponse(question, HttpStatusCode.CREATED, "Question created successfully").from(res)
  }

  private async updateQuestion(req: Request, res: Response): Promise<void> {
    const question = await QuestionController.questionService.update(req.params.questionId, req.body)

    new SuccessfulResponse(question, HttpStatusCode.OK, "Question updated successfully").from(res)
  }

  private async getAllQuestions(req: Request, res: Response): Promise<void> {
    const questions = await QuestionController.questionService.getAll()

    new SuccessfulResponse(questions, HttpStatusCode.OK).from(res)
  }

  private async deleteQuestion(req: Request, res: Response): Promise<void> {
    const data = await QuestionController.questionService.delete(req.params.questionId)

    new SuccessfulResponse(data, HttpStatusCode.OK, "Question deleted successfully").from(res)
  }

  private async getProductQuestions(req: Request, res: Response): Promise<void> {
    const questions = await QuestionController.questionService.getProductQuestions(req.params.productId)

    new SuccessfulResponse(questions, HttpStatusCode.OK).from(res)
  }

  private async getCustomerQuestions(req: Request, res: Response): Promise<void> {
    const questions = await QuestionController.questionService.getCustomerQuestions(req.params.customerId)

    new SuccessfulResponse(questions, HttpStatusCode.OK).from(res)
  }

  private async likeQuestion(req: Request, res: Response): Promise<void> {
    const question = await QuestionController.questionService.likeQuestion(req.params.questionId, req.userId)

    new SuccessfulResponse(question, HttpStatusCode.OK, "Question liked successfully").from(res)
  }

  private async replyQuestion(req: Request, res: Response): Promise<void> {
    const question = await QuestionController.questionService.replyQuestion(req.params.questionId, req.body.content)

    new SuccessfulResponse(question, HttpStatusCode.OK, "Question replied successfully").from(res)
  }

  private async likeReply(req: Request, res: Response): Promise<void> {
    const question = await QuestionController.questionService.likeAnswer(req.params.questionId, req.userId)

    new SuccessfulResponse(question, HttpStatusCode.OK, "Reply liked successfully").from(res)
  }

  getPath(): string {
    return this.path
  }

  getRouter(): Router {
    return this.router
  }
}
