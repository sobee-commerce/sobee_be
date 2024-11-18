import { ICoupon } from "@/interface"
import { CreateCouponRequest, CreateCouponResponse } from "./dto"

export abstract class CouponRepository {
  abstract create(data: CreateCouponRequest): Promise<CreateCouponResponse>
  abstract update(id: string, data: Partial<ICoupon>): Promise<ICoupon>
  abstract delete(id: string): Promise<ICoupon>
  abstract getAll(): Promise<ICoupon[]>
  abstract getById(id: string): Promise<ICoupon>
  abstract getUserCoupons(userId: string): Promise<ICoupon[]>
  // abstract use(id: string, userId: string): Promise<ICoupon>
}
