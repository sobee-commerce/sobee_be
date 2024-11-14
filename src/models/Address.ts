import { IAddress } from "@/interface"
import { Schema, model } from "mongoose"
import { SCHEMA_NAME } from "./schema-name"

export const AddressSchema = new Schema<IAddress>(
  {
    city: String,
    country: String,
    district: String,
    isDefault: {
      type: Boolean,
      default: false
    },
    specificAddress: String,
    ward: String,
    customer: {
      type: Schema.Types.ObjectId,
      ref: SCHEMA_NAME.USERS,
      required: true
    },
    name: String,
    phoneNumber: String
  },
  {
    versionKey: false,
    timestamps: true
  }
)

export default model<IAddress>(SCHEMA_NAME.ADDRESSES, AddressSchema, SCHEMA_NAME.ADDRESSES)
