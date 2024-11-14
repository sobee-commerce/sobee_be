import { Schema, Types, model } from "mongoose"
import { ICredential } from "@/interface"
import { SCHEMA_NAME } from "./schema-name"

const CredentialSchema = new Schema<ICredential>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: SCHEMA_NAME.USERS
    },
    password: {
      type: String
    }
  },
  {
    versionKey: false
  }
)

export default model<ICredential>(SCHEMA_NAME.CREDENTIALS, CredentialSchema, SCHEMA_NAME.CREDENTIALS)
