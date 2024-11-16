import { Types } from "mongoose"

export interface ITax {
  _id?: string | Types.ObjectId
  name: string
  rate: number
  country?: string
  city?: string
  state?: string
  zip?: string
}
