import { IQuestion, IReview } from "@/interface"
import { Schema, model } from "mongoose"
import { SCHEMA_NAME } from "./schema-name"
import Reply from "./Reply"

const QuestionSchema = new Schema<IQuestion>(
  {
    content: {
      required: true,
      type: String
    },
    customer: {
      ref: SCHEMA_NAME.USERS,
      type: Schema.Types.ObjectId
    },
    product: {
      ref: SCHEMA_NAME.PRODUCTS,
      type: Schema.Types.ObjectId
    },
    answer: {
      type: Reply,
      default: null
    },
    likes: [String]
  },
  {
    versionKey: false,
    timestamps: true
  }
)

export default model<IQuestion>(SCHEMA_NAME.QUESTIONS, QuestionSchema, SCHEMA_NAME.QUESTIONS)
