import { ICoupon } from "@/interface"
import { Schema, model } from "mongoose"
import { SCHEMA_NAME } from "./schema-name"
import { ECouponApplyType, ECouponStatus, ECouponType } from "@/enum"

const CouponSchema = new Schema<ICoupon>(
  {
    code: {
      type: String,
      required: true,
      unique: true
    },
    image: {
      type: String,
      required: true,
      default:
        "https://res.cloudinary.com/dtfkou1of/image/upload/v1715880344/sobee-storage/image/coupon/coupon_default.png"
    },
    type: {
      type: String,
      enum: Object.values(ECouponType),
      default: ECouponType.FIXED
    },
    customerUsed: [
      {
        type: Schema.Types.ObjectId,
        ref: SCHEMA_NAME.USERS
      }
    ],
    customerSaved: [
      {
        type: Schema.Types.ObjectId,
        ref: SCHEMA_NAME.USERS
      }
    ],
    minOrderValue: {
      type: Number,
      default: 0
    },
    discountValue: {
      type: Number,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    startDate: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: Object.values(ECouponStatus),
      default: ECouponStatus.ACTIVE
    },
    usageCount: {
      type: Number,
      default: 0
    },
    usageLimit: {
      type: Number,
      required: true
    },
    applyTo: {
      type: String,
      enum: Object.values(ECouponApplyType),
      default: ECouponApplyType.ALL
    },
    productApply: [
      {
        type: Schema.Types.ObjectId,
        ref: SCHEMA_NAME.PRODUCTS
      }
    ]
  },
  {
    versionKey: false,
    timestamps: true
  }
)

export default model<ICoupon>(SCHEMA_NAME.COUPONS, CouponSchema, SCHEMA_NAME.COUPONS)
