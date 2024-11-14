import { ICart } from "@/interface"
import { Schema, model } from "mongoose"
import { SCHEMA_NAME } from "./schema-name"
import { OrderItemSchema } from "./OrderItem"

const CartSchema = new Schema<ICart>(
  {
    cartItems: [OrderItemSchema],
    customer: {
      type: Schema.Types.ObjectId,
      ref: SCHEMA_NAME.USERS
    }
  },
  {
    versionKey: false
  }
)

export default model<ICart>(SCHEMA_NAME.CARTS, CartSchema, SCHEMA_NAME.CARTS)
