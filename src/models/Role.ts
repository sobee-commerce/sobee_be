import { IRole } from "@/interface"
import { Schema, model } from "mongoose"
import { SCHEMA_NAME } from "./schema-name"
import { ERolePermissions } from "@/common/utils/rbac"

const RoleSchema = new Schema<IRole>({
  role_name: {
    type: String,
    unique: true,
    required: true
  },
  grant_lists: [
    {
      resource: {
        type: String,
        required: true
      },
      actions: {
        type: [String],
        enum: ERolePermissions,
        required: true
      },
      attributes: {
        type: String,
        required: true
      }
    }
  ]
})

export default model<IRole>(SCHEMA_NAME.ROLES, RoleSchema, SCHEMA_NAME.ROLES)
