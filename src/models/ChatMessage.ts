import { IChatMessage } from "@/interface"
import { Schema, model } from "mongoose"
import { SCHEMA_NAME } from "./schema-name"
import { EAssetType } from "@/enum"

const ChatMessageSchema = new Schema<IChatMessage>(
  {
    content: {
      type: String,
      required: true
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: SCHEMA_NAME.USERS
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: SCHEMA_NAME.USERS
    },
    contentType: {
      type: String,
      enum: Object.values(EAssetType),
      default: EAssetType.RAW_TEXT
    },
    assets: {
      type: [String]
    }
  },
  {
    versionKey: false,
    timestamps: true
  }
)

// export default model<IChatMessage>(SCHEMA_NAME.CHAT_MESSAGES, ChatMessageSchema, SCHEMA_NAME.CHAT_MESSAGES)
export { ChatMessageSchema }
