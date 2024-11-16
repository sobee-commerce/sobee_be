import { Types } from "mongoose"
import { IAddress } from "./IAddress"

export interface ICustomer {
  _id?: string | Types.ObjectId
  isPhoneNumberVerified?: boolean
  phoneNumberVerifiedAt?: Date
  isEmailVerified?: boolean
  emailVerifiedAt?: Date
  gender?: string
  isActive?: boolean
}
