import { Types } from "mongoose"
import { IRole } from "./IRole"

export interface IStaff {
  _id?: Types.ObjectId | string
  identityCard: string
  staffRole: Types.ObjectId | string | IRole
}
