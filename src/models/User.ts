import { IUser } from "@/interface"
import { Schema, model } from "mongoose"
import { SCHEMA_NAME } from "./schema-name"
import { ERole } from "@/enum"

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true
    },
    avatar: {
      type: String
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    phoneNumber: {
      type: String,
      required: true,
      unique: true
    },
    dateOfBirth: {
      type: Date,
      default: null
    },
    role: {
      type: String,
      enum: Object.values(ERole),
      required: true
    },
    _user: {
      type: Schema.Types.ObjectId,
      refPath: "role",
      default: null
    },
    fcmToken: {
      type: String,
      default: null
    }
  },
  {
    versionKey: false,
    timestamps: true
  }
)

export default model<IUser>(SCHEMA_NAME.USERS, UserSchema, SCHEMA_NAME.USERS)
