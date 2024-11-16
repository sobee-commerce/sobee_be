import { Types } from "mongoose"
import { IProduct } from "./IProduct"
import { IVariant } from "./IVariant"
import { IUser } from "./IUser"
import { EProductSize } from "@/enum"

export interface IOrderItem {
  _id?: string | Types.ObjectId
  product: Types.ObjectId | IProduct | string
  size: EProductSize
  color: string
  customer: Types.ObjectId | string | IUser
  amount: number
  price: number
  subTotal: number
}
