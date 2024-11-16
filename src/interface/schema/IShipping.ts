import { EShippingType } from "@/enum"
import { Types } from "mongoose"

export interface IShipping {
  _id?: string | Types.ObjectId
  name: string
  amount: number
  type: EShippingType
}
