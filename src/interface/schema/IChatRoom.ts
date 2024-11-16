import { Types } from "mongoose"
import { IChatMessage } from "./IChatMessage"
import { IUser } from "./IUser"
import { IOrder } from "./IOrder"
import { IProduct } from "./IProduct"

export interface IChatRoom {
  messages: IChatMessage[]
  title: string
  order: string | Types.ObjectId | IOrder
  product: string | Types.ObjectId | IProduct
  createdBy: string | Types.ObjectId | IUser
  lastMessage: IChatMessage
  isHaveNew: boolean
  staff: {
    user: string | Types.ObjectId | IUser
    isDeleted: boolean
  }
  customer: {
    user: string | Types.ObjectId | IUser
    isDeleted: boolean
  }
  // users: string[] | Types.ObjectId[] | IUser[]
  createdAt?: Date
  updatedAt?: Date
}
