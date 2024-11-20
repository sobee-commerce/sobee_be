import { IReview, IRoute } from "@/interface"
import { ReviewService } from "./review.service"
import { Request, Response, Router } from "express"
import { ErrorResponse, HttpStatusCode, SuccessfulResponse } from "@/common/utils"
import middleware from "@/common/middleware"
import { EActionPermissions, EResourcePermissions } from "@/common/utils/rbac"
import { Review } from "@/models"
import { asyncHandler } from "@/common/utils"
import { ERole } from "@/enum"

export class ReviewController implements IRoute {
  private readonly router: Router
  private readonly path: string

  private readonly PATHS = {
    ROOT: "/",
    REVIEW: "/:reviewId",
    PRODUCT: "/product/:productId",
    CUSTOMER: "/customer/:customerId",
    LIKE: "/like/:reviewId",
    REPLY: "/reply/:reviewId",
    LIKE_REPLY: "/reply/like/:reviewId",
    PRODUCT_AND_CUSTOMER: "/customer/product/:productId",
    ANALYTICS: "/analytics",
    MOCK: "/mock"
  }

  private static readonly reviewService = new ReviewService()

  constructor(path = "/api/review") {
    this.router = Router()
    this.path = path
    this.initializeRoutes()
  }

  private initializeRoutes(): void {
    this.router.get(
      this.PATHS.ROOT,
      middleware.verifyToken,
      middleware.verifyRoles(ERole.ADMIN),
      asyncHandler(this.getReviews)
    )
    this.router.post(
      this.PATHS.ROOT,
      middleware.verifyToken,
      middleware.mustHaveFields<IReview>("content", "rating", "product"),
      middleware.doNotAllowFields<IReview>("customer"),
      asyncHandler(this.createReview)
    )
    this.router.post(this.PATHS.MOCK, asyncHandler(this.createReviewMock))
    this.router.put(
      this.PATHS.REVIEW,
      middleware.verifyToken,
      middleware.doNotAllowFields<IReview>("customer"),
      asyncHandler(this.updateReview)
    )

    this.router.put(this.PATHS.LIKE, middleware.verifyToken, asyncHandler(this.likeReview))
    this.router.put(this.PATHS.REPLY, asyncHandler(this.replyReview))
    this.router.put(this.PATHS.LIKE_REPLY, middleware.verifyToken, asyncHandler(this.likeReply))

    this.router.get(
      this.PATHS.ANALYTICS,
      middleware.verifyToken,
      middleware.verifyRoles(ERole.ADMIN, ERole.STAFF),
      asyncHandler(this.getAnalytics)
    )
    this.router.get(this.PATHS.REVIEW, asyncHandler(this.getReviewsById))
    this.router.get(this.PATHS.PRODUCT, asyncHandler(this.getReviewsByProductId))
    this.router.get(this.PATHS.CUSTOMER, middleware.verifyToken, asyncHandler(this.getReviewsByCustomerId))
    this.router.get(
      this.PATHS.PRODUCT_AND_CUSTOMER,
      middleware.verifyToken,
      asyncHandler(this.getReviewsByProductAndCustomer)
    )
    this.router.delete(
      this.PATHS.ROOT,
      middleware.verifyToken,
      middleware.verifyRoles(ERole.ADMIN),
      asyncHandler(this.deleteAllReviews)
    )
    this.router.delete(
      this.PATHS.REVIEW,
      middleware.verifyToken,
      // middleware.grandAccess(EActionPermissions.DELETEOWN, EResourcePermissions.REVIEW),
      middleware.veryfyOwner<IReview>("customer", Review, "reviewId"),
      asyncHandler(this.deleteReviewById)
    )
  }

  private async createReview(req: Request, res: Response): Promise<void> {
    const data = await ReviewController.reviewService.createReview({ ...req.body, customer: req.userId })
    new SuccessfulResponse(data, HttpStatusCode.CREATED, "Create review successfully").from(res)
  }
  private async createReviewMock(req: Request, res: Response): Promise<void> {
    const data = await ReviewController.reviewService.createReview({ ...req.body })
    new SuccessfulResponse(data, HttpStatusCode.CREATED, "Create review successfully").from(res)
  }

  private async updateReview(req: Request, res: Response): Promise<void> {
    const data = await ReviewController.reviewService.updateReview(req.params.reviewId, req.body, req.userId, req.role)
    new SuccessfulResponse(data, HttpStatusCode.OK, "Review updated successfully").from(res)
  }

  private async getReviews(req: Request, res: Response): Promise<void> {
    const page = parseInt(req.query.page?.toString() || "1")
    const limit = parseInt(req.query.limit?.toString() || "10")
    const keyword = req.query.keyword?.toString()
    const data = await ReviewController.reviewService.getReviews(page, limit, keyword)
    new SuccessfulResponse(data.data, HttpStatusCode.OK, "Get all reviews successfully").withPagination(
      res,
      page,
      limit,
      data.total
    )
  }

  private async getReviewsById(req: Request, res: Response): Promise<void> {
    const data = await ReviewController.reviewService.getReviewsById(req.params.reviewId)
    new SuccessfulResponse(data, HttpStatusCode.OK).from(res)
  }

  private async getReviewsByProductId(req: Request, res: Response): Promise<void> {
    const filterRating = req.query.rating ? Number(req.query.rating) : undefined
    const page = parseInt(req.query.page?.toString() || "1")
    const limit = parseInt(req.query.limit?.toString() || "10")
    const data = await ReviewController.reviewService.getReviewsByProductId(
      req.params.productId,
      page,
      limit,
      filterRating
    )
    new SuccessfulResponse(data.data, HttpStatusCode.OK).withPagination(res, page, limit, data.total)
  }

  private async getReviewsByCustomerId(req: Request, res: Response): Promise<void> {
    const data = await ReviewController.reviewService.getReviewsByCustomerId(req.params.customerId)
    new SuccessfulResponse(data, HttpStatusCode.OK).from(res)
  }

  private async deleteReviewById(req: Request, res: Response): Promise<void> {
    const data = await ReviewController.reviewService.deleteReviewById(req.params.reviewId)
    new SuccessfulResponse(data, HttpStatusCode.OK, "Review deleted successfully").from(res)
  }

  private async deleteAllReviews(req: Request, res: Response): Promise<void> {
    const data = await ReviewController.reviewService.deleteAllReview()
    new SuccessfulResponse(data, HttpStatusCode.OK, "All reviews deleted successfully").from(res)
  }

  private async likeReview(req: Request, res: Response): Promise<void> {
    const data = await ReviewController.reviewService.likeReview(req.params.reviewId, req.userId)
    new SuccessfulResponse(data, HttpStatusCode.OK, "Like review successfully").from(res)
  }

  private async replyReview(req: Request, res: Response): Promise<void> {
    const data = await ReviewController.reviewService.replyReview(req.params.reviewId, req.body.content)
    new SuccessfulResponse(data, HttpStatusCode.OK, "Reply review successfully").from(res)
  }

  private async likeReply(req: Request, res: Response): Promise<void> {
    const data = await ReviewController.reviewService.likeReply(req.params.reviewId, req.userId)
    new SuccessfulResponse(data, HttpStatusCode.OK, "Like reply successfully").from(res)
  }

  private async getReviewsByProductAndCustomer(req: Request, res: Response): Promise<void> {
    const data = await ReviewController.reviewService.getReviewByProductIdAndCustomerId(
      req.params.productId,
      req.userId
    )
    new SuccessfulResponse(data, HttpStatusCode.OK).from(res)
  }

  private async getAnalytics(req: Request, res: Response): Promise<void> {
    const data = await ReviewController.reviewService.getReviewAnalytics()
    new SuccessfulResponse(data, HttpStatusCode.OK).from(res)
  }

  getPath(): string {
    return this.path
  }

  getRouter(): Router {
    return this.router
  }
}
