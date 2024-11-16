import { ENotificationType } from "@/enum"
import { Types } from "mongoose"
import { IUser } from "./IUser"

export interface INotification {
  title: string
  content: string
  read: boolean
  to: string | Types.ObjectId | IUser
  type: ENotificationType
  redirectUrl: string
}
