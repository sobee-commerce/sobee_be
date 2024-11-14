import { EOrderStatus, EPaymentMethod } from "@/enum"
import { IOrder } from "@/interface"
import { Schema, model } from "mongoose"
import { SCHEMA_NAME } from "./schema-name"
import { OrderItemSchema } from "./OrderItem"
import { AddressSchema } from "./Address"

const OrderSchema = new Schema<IOrder>(
  {
    canceledAt: {
      type: Date,
      default: null
    },
    completedAt: {
      type: Date,
      default: null
    },
    coupon: {
      type: Schema.Types.ObjectId,
      ref: SCHEMA_NAME.COUPONS
    },
    customer: {
      type: Schema.Types.ObjectId,
      ref: SCHEMA_NAME.USERS
    },
    deliveredAt: {
      type: Date,
      default: null
    },
    note: { type: String, default: null },
    orderGeneratedId: {
      type: String,
      required: true,
      unique: true
    },
    orderItems: [OrderItemSchema],
    paymentMethod: {
      type: String,
      enum: Object.values(EPaymentMethod),
      default: EPaymentMethod.COD
    },
    shippingAddress: {
      type: AddressSchema,
      required: true
    },
    shippingFee: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: Object.values(EOrderStatus),
      default: EOrderStatus.PENDING
    },
    total: {
      type: Number,
      required: true
    },
    emailAddress: String,
    phoneNumber: String,
    taxFee: Number
  },
  {
    versionKey: false,
    timestamps: true
  }
)

export default model<IOrder>(SCHEMA_NAME.ORDERS, OrderSchema, SCHEMA_NAME.ORDERS)
