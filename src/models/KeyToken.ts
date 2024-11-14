import { Schema, model } from "mongoose"
import { SCHEMA_NAME } from "./schema-name"
import { IKeyToken } from "@/interface/schema"

const KeyTokenSchema = new Schema<IKeyToken>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: SCHEMA_NAME.USERS,
      required: true
    },
    privateKey: {
      type: String,
      require: true
    },
    publicKey: {
      type: String,
      require: true
    },
    refreshToken: {
      type: String
    },
    refreshTokenUsed: {
      type: [String],
      default: []
    }
  },
  {
    versionKey: false,
    timestamps: true
  }
)

export default model<IKeyToken>(SCHEMA_NAME.KEYTOKENS, KeyTokenSchema, SCHEMA_NAME.KEYTOKENS)
