import { IAsset } from "@/interface"
import { Schema, model } from "mongoose"
import { SCHEMA_NAME } from "./schema-name"

const AssetSchema = new Schema<IAsset>(
  {
    folder: {
      type: String,
      default: "images"
    },
    name: {
      type: String,
      required: true
    },
    assets: [
      {
        type: String
      }
    ]
  },
  {
    versionKey: false
  }
)

export default model<IAsset>(SCHEMA_NAME.ASSETS, AssetSchema, SCHEMA_NAME.ASSETS)
