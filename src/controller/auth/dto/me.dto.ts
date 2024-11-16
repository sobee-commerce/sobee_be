import { IAdmin, ICustomer, IStaff } from "@/interface"

export type MeRequest = {
  userId: string
}
export type MeResponse = {
  user: IAdmin | IStaff | ICustomer
}

export type ChangePasswordRequest = {
  userId: string
  oldPassword: string
  newPassword: string
}

export type ChangePasswordResponse = null
