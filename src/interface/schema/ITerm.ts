import { Types } from "mongoose"
import { IUser } from "./IUser"

export interface ITerm {
  _id?: string | Types.ObjectId
  title: string
  description: string
  slug?: string
  type: string
  isApproved: boolean
  issued_by: string | Types.ObjectId | IUser
  createdAt?: string
  updatedAt?: string
}
