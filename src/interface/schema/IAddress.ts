import { Types } from "mongoose"
import { ICustomer } from "./ICustomer"

export interface IAddress {
  _id?: string
  name: string
  phoneNumber: string
  country: string
  city: string
  district: string
  ward: string
  specificAddress: string
  isDefault: boolean
  customer: string | ICustomer | Types.ObjectId
}
