import { Types } from "mongoose"
import { IUser } from "./IUser"

export interface ICard {
  _id?: string
  cardNumber: string
  cardHolderName: string
  expiryDate: string
  cvv: string
  isDefault: boolean
  postalCode: string
  cardBrand: string
  customer: string | IUser | Types.ObjectId
}

export interface IPaymentAccount {
  _id?: string
  accountNumber: string
  accountHolderName: string
  bankName: string
  isDefault: boolean
  customer: string | IUser | Types.ObjectId
}
