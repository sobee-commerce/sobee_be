import { IQuestion, IReply, IReview } from "@/interface"
import { Schema, model } from "mongoose"
import { SCHEMA_NAME } from "./schema-name"

const Reply = new Schema<IReply>(
  {
    content: {
      required: true,
      type: String
    },
    likes: [String]
  },
  {
    versionKey: false,
    timestamps: true
  }
)

export default Reply
