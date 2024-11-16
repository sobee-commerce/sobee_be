import { Types } from "mongoose"

export interface IAsset {
  _id?: string | Types.ObjectId
  name: string
  folder: string
  assets: string[]
}
