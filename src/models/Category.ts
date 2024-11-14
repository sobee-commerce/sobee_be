import { ICategory } from "@/interface"
import { Schema, model } from "mongoose"
import { SCHEMA_NAME } from "./schema-name"

const CategorySchema = new Schema<ICategory>(
  {
    description: String,
    deletedAt: {
      type: Date,
      default: null
    },
    image: String,
    name: {
      type: String,
      unique: true,
      required: true
    },
    slug: {
      type: String,
      unique: true
    },
    parent: {
      type: Schema.Types.ObjectId,
      ref: SCHEMA_NAME.CATEGORIES,
      default: null
    },
    children: [
      {
        type: Schema.Types.ObjectId,
        ref: SCHEMA_NAME.CATEGORIES
      }
    ]
  },
  {
    versionKey: false
  }
)

export default model<ICategory>(SCHEMA_NAME.CATEGORIES, CategorySchema, SCHEMA_NAME.CATEGORIES)
