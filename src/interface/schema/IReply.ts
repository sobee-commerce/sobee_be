import { Types } from "mongoose"
import { IUser } from "./IUser"

export interface IReply {
  _id?: string | Types.ObjectId
  content: string
  likes: string[]
}
