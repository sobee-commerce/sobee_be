import { IVariant } from "@/interface"
import { Schema, model } from "mongoose"
import { SCHEMA_NAME } from "./schema-name"
import { EProductSize } from "@/enum"

const Variant = new Schema<IVariant>(
  {
    amount: {
      type: Number,
      default: 0
    },
    assets: [
      {
        type: String
      }
    ],
    price: {
      type: Number,
      required: true
    },
    size: {
      type: String,
      enum: Object.values(EProductSize),
      default: EProductSize.S
    },
    color: {
      type: String,
      default: "#000000"
    }
  },
  {
    versionKey: false
  }
)

export default Variant

// export default model<IVariant>(SCHEMA_NAME.VARIANTS, Variant, SCHEMA_NAME.VARIANTS)
