import { Types } from "mongoose"
import { IProduct } from "./IProduct"
import { ICustomer } from "./ICustomer"
import { IAsset } from "./IAsset"
import { IUser } from "./IUser"
import { IReply } from "./IReply"

export interface IReview {
  product: string | Types.ObjectId | IProduct
  customer: string | Types.ObjectId | IUser
  rating: number
  content: string
  reply: IReply
  assets: string[]
  likes: string[]
  createdAt?: Date
  updatedAt?: Date
}
