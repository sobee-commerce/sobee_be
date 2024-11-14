import { IReview } from "@/interface"
import { Schema, model } from "mongoose"
import { SCHEMA_NAME } from "./schema-name"
import Reply from "./Reply"

const ReviewSchema = new Schema<IReview>(
  {
    assets: {
      type: [String]
    },
    content: {
      required: true,
      type: String
    },
    customer: {
      ref: SCHEMA_NAME.USERS,
      type: Schema.Types.ObjectId,
      required: true
    },
    product: {
      ref: SCHEMA_NAME.PRODUCTS,
      type: Schema.Types.ObjectId,
      required: true
    },
    rating: {
      max: 5,
      min: 1,
      required: true,
      type: Number
    },
    likes: [String],
    reply: {
      type: Reply,
      default: null
    }
  },
  {
    versionKey: false,
    timestamps: true
  }
)

export default model<IReview>(SCHEMA_NAME.REVIEWS, ReviewSchema, SCHEMA_NAME.REVIEWS)
