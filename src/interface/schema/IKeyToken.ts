import { Types } from "mongoose"

export interface IKeyToken {
  user: Types.ObjectId | string
  publicKey: string
  privateKey: string
  refreshToken: string
  refreshTokenUsed: string[]
}
