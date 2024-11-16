import { EProductStatus, EProductType } from "@/enum"
import { Types } from "mongoose"
import { ICategory } from "./ICategory"
import { IBrand } from "./IBrand"
import { IVariant } from "./IVariant"
import { IShipping } from "./IShipping"
import { ITax } from "./ITax"

export interface IProduct {
  _id?: string | Types.ObjectId
  name: string
  slug: string
  description: string
  displayPrice: number
  minPrice: number
  maxPrice: number
  thumbnail: string
  brand: string | Types.ObjectId | IBrand
  category: Types.ObjectId | ICategory | string
  shippingFee: string | Types.ObjectId | IShipping
  tax: string | Types.ObjectId | ITax
  discount: number
  quantity: number
  sold: number
  status: EProductStatus
  favoritesBy: string[]
  type: EProductType
  variants: IVariant[]
  ratingCount: number
  ratingValue: number
  isVariation: boolean
  isFeatured: boolean
  isDraft: boolean
  isDiscount: boolean
  deletedAt: Date
}
