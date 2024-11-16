import { Types } from "mongoose"
import { IUser } from "./IUser"

export interface IFaq {
  _id?: string | Types.ObjectId
  title: string
  description: string
  slug?: string
  type: string
  issued_by: string | Types.ObjectId | IUser
  createdAt?: string
  updatedAt?: string
}
