import { IOrderItem } from "@/interface"
import { Schema, model } from "mongoose"
import { SCHEMA_NAME } from "./schema-name"
import { EProductSize } from "@/enum"
import Variant from "./Variant"

const OrderItemSchema = new Schema<IOrderItem>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: SCHEMA_NAME.PRODUCTS
    },
    customer: {
      type: Schema.Types.ObjectId,
      ref: SCHEMA_NAME.USERS
    },
    subTotal: Number,
    size: String,
    color: String,
    amount: Number,
    price: Number
  },
  {
    versionKey: false,
    timestamps: true
  }
)

export { OrderItemSchema }

export default model<IOrderItem>(SCHEMA_NAME.ORDER_ITEMS, OrderItemSchema, SCHEMA_NAME.ORDER_ITEMS)
