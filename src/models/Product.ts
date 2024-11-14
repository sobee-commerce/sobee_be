import { EProductStatus, EProductType } from "@/enum"
import { IProduct } from "@/interface"
import { Schema, model } from "mongoose"
import { SCHEMA_NAME } from "./schema-name"
import Variant from "./Variant"

const ProductSchema = new Schema<IProduct>(
  {
    category: {
      ref: SCHEMA_NAME.CATEGORIES,
      type: Schema.Types.ObjectId
    },
    name: {
      type: String,
      required: true
    },
    slug: {
      type: String,
      unique: true
    },
    brand: {
      ref: SCHEMA_NAME.BRAND,
      type: Schema.Types.ObjectId,
      default: null
    },
    description: String,
    deletedAt: {
      type: Date,
      default: null
    },
    isFeatured: {
      type: Boolean,
      default: false
    },
    discount: {
      type: Number,
      default: 0
    },
    displayPrice: {
      type: Number,
      required: true
    },
    minPrice: {
      type: Number,
      required: true
    },
    maxPrice: {
      type: Number,
      required: true
    },
    type: {
      type: String,
      enum: Object.values(EProductType),
      default: EProductType.SIMPLE
    },
    favoritesBy: [String],
    variants: [Variant],
    quantity: {
      type: Number,
      required: true
    },
    sold: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: Object.values(EProductStatus),
      default: EProductStatus.ACTIVE
    },
    isDiscount: {
      type: Boolean,
      default: false
    },
    isDraft: {
      type: Boolean,
      default: false
    },
    isVariation: {
      type: Boolean,
      default: false
    },
    ratingCount: {
      type: Number,
      default: 0
    },
    ratingValue: {
      type: Number,
      default: 0
    },
    thumbnail: String,
    shippingFee: {
      ref: SCHEMA_NAME.SHIPPINGS,
      type: Schema.Types.ObjectId
    },
    tax: {
      ref: SCHEMA_NAME.TAX,
      type: Schema.Types.ObjectId
    }
  },
  {
    versionKey: false,
    timestamps: true
  }
)

ProductSchema.pre("save", function (next) {
  if (this.discount > 0) {
    this.isDiscount = true
  } else {
    this.isDiscount = false
  }
  if (this.variants.length > 0) {
    this.isVariation = true
  }

  next()
})

ProductSchema.pre("updateOne", function (next) {
  if (this.get("discount") > 0) {
    this.set("isDiscount", true)
  } else {
    this.set("isDiscount", false)
  }

  if (this.get("variants").length > 0) {
    this.set("isVariation", true)
  } else {
    this.set("isVariation", false)
  }

  next()
})

export default model<IProduct>(SCHEMA_NAME.PRODUCTS, ProductSchema, SCHEMA_NAME.PRODUCTS)
