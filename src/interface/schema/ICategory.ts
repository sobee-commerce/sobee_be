import { Types } from "mongoose"

export interface ICategory {
  _id?: string
  name: string
  slug: string
  parent: null | string | Types.ObjectId | ICategory
  children: string[] | Types.ObjectId[] | ICategory[]
  description: string
  deletedAt: Date
  image: string
}
