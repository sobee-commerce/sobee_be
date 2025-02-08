import { Types } from "mongoose"
import { ICustomer } from "./ICustomer"
import { ECouponApplyType, ECouponStatus, ECouponType } from "@/enum"
import { IProduct } from "./IProduct"

export interface ICoupon {
  _id?: string
  code: string
  image: string
  type: ECouponType
  discountValue: number
  minOrderValue: number
  startDate: Date
  endDate: Date
  usageLimit: number
  usageCount: number
  customerUsed: string[] | ICustomer[] | Types.ObjectId[]
  customerSaved: string[] | ICustomer[] | Types.ObjectId[]
  status: ECouponStatus
  applyTo: ECouponApplyType
  productApply: string[] | Types.ObjectId[] | IProduct[]
  createdAt?: Date
}
