import { IPaymentAccount } from "@/interface"
import { Schema, model } from "mongoose"
import { SCHEMA_NAME } from "./schema-name"

const PaymentAccount = new Schema<IPaymentAccount>({
  accountHolderName: String,
  accountNumber: String,
  bankName: String,
  isDefault: {
    type: Boolean,
    default: false
  },
  customer: {
    type: Schema.Types.ObjectId,
    ref: SCHEMA_NAME.USERS
  }
})

export default model<IPaymentAccount>(SCHEMA_NAME.PAYMENT_ACCOUNTS, PaymentAccount, SCHEMA_NAME.PAYMENT_ACCOUNTS)
