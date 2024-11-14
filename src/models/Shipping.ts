import { IShipping } from "@/interface"
import { Schema, model } from "mongoose"
import { SCHEMA_NAME } from "./schema-name"
import { EShippingType } from "@/enum"

const ShippingChema = new Schema<IShipping>(
  {
    name: {
      type: String,
      unique: true,
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    type: {
      type: String,
      enum: Object.values(EShippingType),
      default: EShippingType.FIXED
    }
  },
  {
    versionKey: false,
    timestamps: true
  }
)

export default model<IShipping>(SCHEMA_NAME.SHIPPINGS, ShippingChema, SCHEMA_NAME.SHIPPINGS)
