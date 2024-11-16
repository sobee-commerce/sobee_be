import { EDayOffStatus } from "@/enum"
import { Types } from "mongoose"
import { IUser } from "./IUser"
import { IStaff } from "./IStaff"

export interface IDayOff {
  _id?: string | Types.ObjectId
  staff: string | Types.ObjectId | IUser<IStaff>
  startDate: Date | string
  endDate: Date | string
  reason: string
  status: EDayOffStatus
}
