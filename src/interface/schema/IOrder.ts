import { Types } from "mongoose"
import { ICustomer } from "./ICustomer"
import { EOrderStatus, EPaymentMethod } from "@/enum"
import { IAddress } from "./IAddress"
import { IOrderItem } from "./IOrderItem"
import { ICoupon } from "./ICoupon"

export interface IOrder {
  orderGeneratedId: string
  orderItems: Types.ObjectId[] | IOrderItem[] | string[]
  customer: Types.ObjectId | ICustomer | string
  status: EOrderStatus
  shippingFee: number
  taxFee: number
  total: number
  paymentMethod: EPaymentMethod
  isPaid: boolean
  shippingAddress: IAddress
  phoneNumber: string
  emailAddress: string
  note: string
  coupon: Types.ObjectId | string | ICoupon
  canceledAt: Date | null
  deliveredAt: Date | null
  completedAt: Date | null
  createdAt?: Date
  updatedAt?: Date
}
