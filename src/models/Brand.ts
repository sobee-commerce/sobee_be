import { IBrand } from "@/interface"
import { Schema, model } from "mongoose"
import { SCHEMA_NAME } from "./schema-name"

const BrandSchema = new Schema<IBrand>(
  {
    name: { type: String, required: true },
    logo: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    website: { type: String, required: true },
    products: [{ type: Schema.Types.ObjectId, ref: SCHEMA_NAME.PRODUCTS }]
  },
  {
    timestamps: true,
    versionKey: false
  }
)

export default model<IBrand>(SCHEMA_NAME.BRAND, BrandSchema, SCHEMA_NAME.BRAND)
