import { ICard } from "@/interface"
import { Schema, model } from "mongoose"
import { SCHEMA_NAME } from "./schema-name"

const PaymentCard = new Schema<ICard>({
  cardHolderName: String,
  cardNumber: {
    unique: true,
    type: String
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  customer: {
    type: Schema.Types.ObjectId,
    ref: SCHEMA_NAME.USERS
  },
  cvv: String,
  expiryDate: String,
  postalCode: String,
  cardBrand: String
})

export default model<ICard>(SCHEMA_NAME.PAYMENT_CARDS, PaymentCard, SCHEMA_NAME.PAYMENT_CARDS)
