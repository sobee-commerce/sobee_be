import { ENotificationType } from "@/enum"
import { Types } from "mongoose"
import { IUser } from "./IUser"

export interface INotification {
  title: string
  content: string
  imageUrl?: string
  read: string[]
  to: string[]
  type: ENotificationType
  redirectUrl: string
}
