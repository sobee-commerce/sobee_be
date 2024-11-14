import { IStaff } from "@/interface"
import { Schema, model } from "mongoose"
import { SCHEMA_NAME } from "./schema-name"

const StaffSchema = new Schema<IStaff>(
  {
    identityCard: {
      type: String,
      unique: true
    },
    staffRole: {
      type: Schema.Types.ObjectId,
      ref: SCHEMA_NAME.ROLES
    }
  },
  {
    versionKey: false
  }
)

export default model<IStaff>(SCHEMA_NAME.STAFFS, StaffSchema, SCHEMA_NAME.STAFFS)
