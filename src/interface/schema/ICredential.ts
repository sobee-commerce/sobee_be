import { Types } from "mongoose"

export interface ICredential {
  userId: Types.ObjectId
  password: string
}
