import { ICoupon } from "@/interface"
import { CouponRepository } from "./coupon.repository"
import { Coupon } from "@/models"
import { ObjectModelNotFoundException } from "@/common/exceptions"
import { ECouponApplyType, ECouponStatus } from "@/enum"
import { BadRequestResponse } from "@/common/utils"

export class CouponService implements CouponRepository {
  async create(data: ICoupon): Promise<ICoupon> {
    const { startDate, endDate, discountValue, code } = data

    if (startDate < new Date()) throw new Error("Start date cannot be in the past")

    if (startDate > endDate) throw new Error("Start date cannot be greater than end date")

    if (discountValue < 0) throw new Error("Discount value cannot be negative")

    return await Coupon.create(data)
  }
  async update(id: string, data: Partial<ICoupon>): Promise<ICoupon> {
    const { startDate, endDate, discountValue, code } = data

    if (startDate && startDate < new Date()) throw new Error("Start date cannot be in the past")

    if (startDate && endDate && startDate > endDate) throw new Error("Start date cannot be greater than end date")

    if (discountValue && discountValue < 0) throw new Error("Discount value cannot be negative")

    if (endDate && new Date(endDate) < new Date()) {
      data.status = ECouponStatus.EXPIRED
    }

    const foundCoupon = await Coupon.findById(id)

    if (!foundCoupon) throw new ObjectModelNotFoundException("Coupon not found")

    if (foundCoupon.status === ECouponStatus.EXPIRED && endDate && new Date(endDate) > new Date()) {
      data.status = ECouponStatus.ACTIVE
    }

    foundCoupon.set(data)

    // const updated = await Coupon.findByIdAndUpdate(id, { $set: data }, { new: true })
    // if (!updated) throw new ObjectModelNotFoundException("Coupon not found")
    return await foundCoupon.save()
  }
  async delete(id: string): Promise<ICoupon> {
    const deleted = await Coupon.findByIdAndDelete(id)
    if (!deleted) throw new ObjectModelNotFoundException("Coupon not found")
    return deleted
  }
  async getAll(): Promise<ICoupon[]> {
    return await Coupon.find()
  }

  async getById(id: string): Promise<ICoupon> {
    const coupon = await Coupon.findById(id)
    if (!coupon) throw new ObjectModelNotFoundException("Coupon not found")
    return coupon
  }

  async getUserCoupons(userId: string): Promise<ICoupon[]> {
    return await Coupon.find({
      customerUsed: {
        $elemMatch: {
          $eq: userId
        }
      }
    })
  }

  async activeCoupon(id: string): Promise<ICoupon> {
    const coupon = await Coupon.findByIdAndUpdate(
      id,
      {
        $set: {
          status: ECouponStatus.ACTIVE
        }
      },
      { new: true }
    ).lean()
    if (!coupon) throw new ObjectModelNotFoundException("Coupon not found")
    return coupon
  }

  async deactiveCoupon(id: string): Promise<ICoupon> {
    const coupon = await Coupon.findByIdAndUpdate(
      id,
      {
        $set: {
          status: ECouponStatus.DISABLED
        }
      },
      { new: true }
    ).lean()
    if (!coupon) throw new ObjectModelNotFoundException("Coupon not found")

    return coupon
  }

  async validate(code: string, userId: string, orderProducts: string[], orderValue: number): Promise<ICoupon> {
    const coupon = await Coupon.findOne({ code })

    if (!coupon) throw new ObjectModelNotFoundException("Coupon not found")

    if (coupon.status === ECouponStatus.DISABLED) throw new BadRequestResponse("Coupon disabled")
    if (coupon.status === ECouponStatus.EXPIRED) throw new BadRequestResponse("Coupon expired")

    if (coupon.endDate < new Date()) {
      coupon.status = ECouponStatus.EXPIRED
      await coupon.save()
      throw new BadRequestResponse("Coupon expired")
    }

    if (coupon.startDate > new Date()) throw new BadRequestResponse("Coupon not yet active")

    if (orderValue < coupon.minOrderValue) throw new BadRequestResponse("Order value less than minimum order value")

    if (coupon.usageCount >= coupon.usageLimit) throw new BadRequestResponse("Coupon usage limit exceeded")

    if (coupon.applyTo === ECouponApplyType.SPECIFIC) {
      if (!orderProducts.every((productId) => (coupon.productApply as string[]).includes(productId))) {
        throw new BadRequestResponse(
          "Coupon is applicable only to specific products. One or more products in the order are not eligible for this coupon"
        )
      }
    }
    console.log(coupon.customerUsed.toString(), userId)
    if (coupon.customerUsed.toString().includes(userId)) throw new BadRequestResponse("Coupon already used")

    return coupon
  }

  async use(code: string, userId: string): Promise<ICoupon> {
    const coupon = await Coupon.findOne({ code })

    if (!coupon) throw new ObjectModelNotFoundException("Coupon not found")

    if (coupon.customerUsed.includes(userId as any)) throw new BadRequestResponse("Coupon already used")

    coupon.customerUsed.push(userId as any)

    coupon.usageCount++

    if (coupon.usageCount === coupon.usageLimit) {
      coupon.status = ECouponStatus.DISABLED
    }

    await coupon.save()

    return coupon
  }

  async getToday(): Promise<ICoupon[]> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return await Coupon.find({
      startDate: { $lte: today },
      endDate: { $gte: today }
    })
  }

  async getByCode(code: string): Promise<ICoupon> {
    const coupon = await Coupon.findOne(
      { code },
      {},
      {
        populate: {
          path: "productApply",
          populate: [
            {
              path: "category",
              select: "name slug"
            },
            {
              path: "variants"
            },
            {
              path: "brand",
              select: "name logo"
            },
            {
              path: "tax",
              select: "name rate"
            },
            {
              path: "shippingFee"
            }
          ]
        }
      }
    )

    if (!coupon) throw new ObjectModelNotFoundException("Coupon not found")

    return coupon
  }
}
