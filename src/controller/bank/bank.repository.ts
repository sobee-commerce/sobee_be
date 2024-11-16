import { IPaymentAccount } from "@/interface"
import { DeleteResult } from "mongodb"

export abstract class PaymentAccountRepository {
  abstract create(req: IPaymentAccount): Promise<IPaymentAccount>
  abstract update(id: string, data: Partial<IPaymentAccount>, requestId: string, role: string): Promise<IPaymentAccount>
  abstract delete(id: string, requestId: string, role: string): Promise<DeleteResult>
  abstract getCustomerPaymentAccounts(customerId: string): Promise<IPaymentAccount[]>
  abstract setDefaultPaymentAccount(paymentAccountId: string, requestId: string, role: string): Promise<IPaymentAccount>
}
