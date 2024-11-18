import { ICoupon, IRoute } from "@/interface"
import { CouponService } from "./coupon.service"
import { Request, Response, Router } from "express"
import { ErrorResponse, HttpStatusCode, SuccessfulResponse } from "@/common/utils"
import middleware from "@/common/middleware"
import { ERole } from "@/enum"
import { asyncHandler } from "@/common/utils"

export class CouponController implements IRoute {
  private readonly router: Router
  private readonly path: string

  private readonly PATHS = {
    ROOT: "/",
    COUPON: "/:couponId",
    ACTIVE: "/:couponId/active",
    DEACTIVE: "/:couponId/deactive",
    USER: "/user",
    USE: "/:couponId/use",
    VALIDATE: "/validate",
    TODAY: "/today",
    CODE: "/code/:code"
  }

  private static readonly couponService = new CouponService()

  constructor(path = "/api/coupon") {
    this.router = Router()
    this.path = path
    this.initializeRoutes()
  }

  private initializeRoutes(): void {
    this.router.post(
      this.PATHS.ROOT,
      middleware.verifyToken,
      middleware.verifyRoles(ERole.ADMIN, ERole.STAFF),
      middleware.mustHaveFields<ICoupon>(
        "code",
        "discountValue",
        "startDate",
        "endDate",
        "usageLimit",
        "minOrderValue",
        "applyTo"
      ),
      middleware.doNotAllowFields<ICoupon>("customerUsed", "usageCount"),
      asyncHandler(this.createCoupon)
    )
    this.router.put(
      this.PATHS.COUPON,
      middleware.verifyToken,
      middleware.verifyRoles(ERole.ADMIN, ERole.STAFF),
      asyncHandler(this.updateCoupon)
    )
    this.router.delete(
      this.PATHS.COUPON,
      middleware.verifyToken,
      middleware.verifyRoles(ERole.ADMIN, ERole.STAFF),
      asyncHandler(this.deleteCoupon)
    )
    this.router.get(this.PATHS.ROOT, asyncHandler(this.getCoupons))
    middleware.verifyToken, this.router.get(this.PATHS.USER, middleware.verifyToken, asyncHandler(this.getUserCoupons))
    this.router.get(this.PATHS.CODE, asyncHandler(this.getCouponByCode))
    this.router.get(this.PATHS.TODAY, middleware.verifyToken, asyncHandler(this.getTodayCoupons))
    this.router.get(this.PATHS.COUPON, asyncHandler(this.getCoupon))
    this.router.put(
      this.PATHS.ACTIVE,
      middleware.verifyToken,
      middleware.verifyRoles(ERole.ADMIN, ERole.STAFF),
      asyncHandler(this.activeCoupon)
    )
    this.router.put(
      this.PATHS.DEACTIVE,
      middleware.verifyToken,
      middleware.verifyRoles(ERole.ADMIN, ERole.STAFF),
      asyncHandler(this.deactiveCoupon)
    )

    this.router.post(
      this.PATHS.VALIDATE,
      middleware.verifyToken,
      middleware.mustHaveFields<{ code: string; orderProducts: string[]; orderValue: number }>("code", "orderValue"),
      asyncHandler(this.validateCoupon)
    )
  }

  private async createCoupon(req: Request, res: Response): Promise<void> {
    const data = await CouponController.couponService.create(req.body)
    new SuccessfulResponse(data, HttpStatusCode.CREATED, "Coupon created successfully").from(res)
  }

  private async updateCoupon(req: Request, res: Response): Promise<void> {
    const data = await CouponController.couponService.update(req.params.couponId, req.body)
    new SuccessfulResponse(data, HttpStatusCode.OK, "Coupon updated successfully").from(res)
  }

  private async deleteCoupon(req: Request, res: Response): Promise<void> {
    const data = await CouponController.couponService.delete(req.params.couponId)
    new SuccessfulResponse(data, HttpStatusCode.OK, "Coupon deleted successfully").from(res)
  }

  private async getCoupon(req: Request, res: Response): Promise<void> {
    const data = await CouponController.couponService.getById(req.params.couponId)
    new SuccessfulResponse(data, HttpStatusCode.OK).from(res)
  }

  private async getCoupons(req: Request, res: Response): Promise<void> {
    const data = await CouponController.couponService.getAll()
    new SuccessfulResponse(data, HttpStatusCode.OK).from(res)
  }

  private async getUserCoupons(req: Request, res: Response): Promise<void> {
    const data = await CouponController.couponService.getUserCoupons(req.userId)
    new SuccessfulResponse(data, HttpStatusCode.OK).from(res)
  }

  private async activeCoupon(req: Request, res: Response): Promise<void> {
    const data = await CouponController.couponService.activeCoupon(req.params.couponId)
    new SuccessfulResponse(data, HttpStatusCode.OK, "Coupon activated successfully").from(res)
  }

  private async deactiveCoupon(req: Request, res: Response): Promise<void> {
    const data = await CouponController.couponService.deactiveCoupon(req.params.couponId)
    new SuccessfulResponse(data, HttpStatusCode.OK, "Coupon deactivated successfully").from(res)
  }

  private async validateCoupon(req: Request, res: Response): Promise<void> {
    const data = await CouponController.couponService.validate(
      req.body.code,
      req.userId,
      req.body.orderProducts,
      req.body.orderValue
    )
    new SuccessfulResponse(data, HttpStatusCode.OK, "Coupon validated successfully").from(res)
  }

  private async getTodayCoupons(req: Request, res: Response): Promise<void> {
    const data = await CouponController.couponService.getToday()
    new SuccessfulResponse(data, HttpStatusCode.OK).from(res)
  }

  private async getCouponByCode(req: Request, res: Response): Promise<void> {
    const data = await CouponController.couponService.getByCode(req.params.code)
    new SuccessfulResponse(data, HttpStatusCode.OK).from(res)
  }

  getPath(): string {
    return this.path
  }

  getRouter(): Router {
    return this.router
  }
}
