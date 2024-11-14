import { Schema, model } from "mongoose"
import { IDayOff } from "@/interface"
import { SCHEMA_NAME } from "./schema-name"
import { EDayOffStatus } from "@/enum"

const DayOffSchema = new Schema<IDayOff>(
  {
    staff: {
      type: Schema.Types.ObjectId,
      ref: SCHEMA_NAME.USERS
    },
    reason: {
      type: String,
      required: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: Object.values(EDayOffStatus),
      default: EDayOffStatus.PENDING
    }
  },
  {
    versionKey: false,
    timestamps: true
  }
)

export default model<IDayOff>(SCHEMA_NAME.DAY_OFF, DayOffSchema, SCHEMA_NAME.DAY_OFF)
