import { Types } from "mongoose"
import { EAssetType } from "@/enum"
import { IUser } from "./IUser"

export interface IChatMessage {
  content: string
  sender: string | Types.ObjectId | IUser
  receiver: string | Types.ObjectId | IUser
  contentType: EAssetType
  assets?: string[]
  createdAt?: Date
  updatedAt?: Date
}
