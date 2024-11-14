import { ENotificationType, ESendNotificationType } from "@/enum"
import { INotification } from "@/interface"
import { Schema, model } from "mongoose"
import { SCHEMA_NAME } from "./schema-name"

const NotificationSchema = new Schema<INotification>(
  {
    content: String,
    read: {
      type: Boolean,
      default: false
    },
    redirectUrl: String,
    title: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: Object.values(ENotificationType),
      default: ENotificationType.INFO
    },
    to: {
      type: Schema.Types.ObjectId,
      ref: SCHEMA_NAME.USERS,
      default: null
    }
  },
  {
    versionKey: false,
    timestamps: true
  }
)

export default model<INotification>(SCHEMA_NAME.NOTIFICATIONS, NotificationSchema, SCHEMA_NAME.NOTIFICATIONS)
