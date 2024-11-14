import { IAdmin } from "@/interface"
import { Schema, model } from "mongoose"
import { SCHEMA_NAME } from "./schema-name"

const AdminSchema = new Schema<IAdmin>(
  {},
  {
    versionKey: false
  }
)

export default model<IAdmin>(SCHEMA_NAME.ADMINS, AdminSchema, SCHEMA_NAME.ADMINS)
