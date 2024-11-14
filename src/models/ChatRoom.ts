import { IChatRoom } from "@/interface"
import { Schema, model } from "mongoose"
import { SCHEMA_NAME } from "./schema-name"
import { ChatMessageSchema } from "./ChatMessage"

const ChatRoomSchema = new Schema<IChatRoom>(
  {
    messages: [ChatMessageSchema],
    title: {
      type: String,
      default: "No title"
    },
    order: {
      type: Schema.Types.ObjectId,
      ref: SCHEMA_NAME.ORDERS,
      default: null
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: SCHEMA_NAME.PRODUCTS,
      default: null
    },
    lastMessage: {
      type: ChatMessageSchema,
      default: null
    },
    isHaveNew: {
      type: Boolean,
      default: false
    },
    staff: {
      user: {
        type: Schema.Types.ObjectId,
        ref: SCHEMA_NAME.USERS
      },
      isDeleted: {
        type: Boolean,
        default: false
      }
    },
    customer: {
      user: {
        type: Schema.Types.ObjectId,
        ref: SCHEMA_NAME.USERS
      },
      isDeleted: {
        type: Boolean,
        default: false
      }
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: SCHEMA_NAME.USERS
    }
    // users: [
    //   {
    //     type: Schema.Types.ObjectId,
    //     ref: SCHEMA_NAME.USERS
    //   }
    // ]
  },
  {
    versionKey: false,
    timestamps: true
  }
)

export default model<IChatRoom>(SCHEMA_NAME.CHAT_ROOMS, ChatRoomSchema, SCHEMA_NAME.CHAT_ROOMS)
