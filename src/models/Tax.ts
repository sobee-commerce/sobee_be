import { ITax } from "@/interface"
import { Schema, model } from "mongoose"
import { SCHEMA_NAME } from "./schema-name"

const TaxChema = new Schema<ITax>(
  {
    name: {
      type: String,
      unique: true,
      required: true
    },
    rate: {
      type: Number,
      required: true
    },
    country: {
      type: String
    },
    city: {
      type: String
    },
    state: {
      type: String
    },
    zip: {
      type: String
    }
  },
  {
    versionKey: false,
    timestamps: true
  }
)

export default model<ITax>(SCHEMA_NAME.TAX, TaxChema, SCHEMA_NAME.TAX)
