import { IUser } from "@/interface"

export type UpdateUserInfoRequest = Omit<IUser, "_user" | "role">

export type UpdateUserInfoResponse = IUser
