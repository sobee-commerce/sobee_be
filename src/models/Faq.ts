import { IFaq } from "@/interface/schema/IFaq"
import { Schema, model } from "mongoose"
import { SCHEMA_NAME } from "./schema-name"
import slugify from "slugify"

const FaqSchema = new Schema<IFaq>(
  {
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    slug: {
      type: String,
      unique: true,
      required: true
    },
    type: {
      type: String,
      required: true
    },
    issued_by: {
      type: Schema.Types.ObjectId,
      ref: "users"
    }
  },
  {
    versionKey: false,
    timestamps: true
  }
)

FaqSchema.pre(["save", "validate"], function (next) {
  this.slug = slugify(this.title, { lower: true })
  next()
})

FaqSchema.pre("findOneAndUpdate", function (next) {
  const title = this.get("title")
  this.set("slug", slugify(title, { lower: true }))
  next()
})

export default model<IFaq>(SCHEMA_NAME.FAQ, FaqSchema, SCHEMA_NAME.FAQ)
