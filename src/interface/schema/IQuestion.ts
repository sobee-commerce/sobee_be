import { Types } from "mongoose"
import { IProduct } from "./IProduct"
import { IUser } from "./IUser"
import { IReply } from "./IReply"

export interface IQuestion {
  _id?: string
  content: string
  answer: IReply
  product: string | IProduct | Types.ObjectId
  customer: string | Types.ObjectId | IUser
  likes: string[]
}
