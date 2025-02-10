import { ERole } from "@/enum"
import { IAdmin } from "./IAdmin"
import { ICustomer } from "./ICustomer"
import { IStaff } from "./IStaff"
import { Types } from "mongoose"

export interface IUser<T = ICustomer | IAdmin | IStaff> {
  _id?: Types.ObjectId | string
  email: string
  phoneNumber: string
  password?: string
  name: string
  avatar: string
  dateOfBirth: Date
  role: ERole
  _user: T | Types.ObjectId | string
  fcmToken: string | null
}
