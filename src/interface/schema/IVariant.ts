import { Types } from "mongoose"
import { EProductSize } from "@/enum"

export interface IVariant {
  _id?: string | Types.ObjectId
  assets?: string[]
  amount: number
  price: number
  size: EProductSize
  color: string
}
