import { Types } from "mongoose"
import { ICustomer } from "./ICustomer"
import { IOrderItem } from "./IOrderItem"

export interface ICart {
  customer: string | Types.ObjectId | ICustomer
  cartItems: string[] | Types.ObjectId[] | IOrderItem[]
}
