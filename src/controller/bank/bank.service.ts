import { IPaymentAccount } from "@/interface"
import { PaymentAccountRepository } from "./bank.repository"
import { PaymentAccount } from "@/models"
import { ObjectModelNotFoundException, ObjectModelOperationException, UnauthorizedException } from "@/common/exceptions"
import { ERole } from "@/enum"
import { DeleteResult } from "mongodb"

export class PaymentAccountService implements PaymentAccountRepository {
  async create(req: IPaymentAccount): Promise<IPaymentAccount> {
    const paymentAccount = await PaymentAccount.findOne({
      accountNumber: req.accountNumber,
      customer: req.customer
    })

    if (paymentAccount) throw new ObjectModelOperationException("This payment account already exists")

    const newPaymentAccount = new PaymentAccount(req)

    //find the default paymentAccount of the customer in database
    const defaultPaymentAccount = await PaymentAccount.findOne({ customer: req.customer, isDefault: true })

    //if the customer has no default paymentAccount, create the new paymentAccount as default
    if (!defaultPaymentAccount) {
      newPaymentAccount.isDefault = true
      return await newPaymentAccount.save()
    }

    //if the customer has a default paymentAccount, and req.isDefault is true, change the default paymentAccount to not default
    if (req.isDefault === true) {
      defaultPaymentAccount.isDefault = false
      await defaultPaymentAccount.save()
    }

    //create the new paymentAccount
    return await newPaymentAccount.save()
  }
  async update(id: string, data: Partial<IPaymentAccount>, requestId: string, role: string): Promise<IPaymentAccount> {
    //if data.isDefault is true
    if (data.isDefault === true) {
      //find the default paymentAccount of the customer in database
      const defaultPaymentAccount = await PaymentAccount.findOne({ customer: requestId, isDefault: true })
      //if the customer has a default paymentAccount, change the default paymentAccount to false
      if (defaultPaymentAccount) {
        defaultPaymentAccount.isDefault = false
        await defaultPaymentAccount.save()
      }
    }

    const updated = await PaymentAccount.findByIdAndUpdate(id, { $set: data }, { new: true }).lean()
    //if the paymentAccount is not found, throw an error
    if (!updated) throw new ObjectModelNotFoundException("PaymentAccount not found")
    //if the paymentAccount is not the paymentAccount of the customer, throw an error
    if (updated.customer.toString() !== requestId && role === ERole.CUSTOMER)
      throw new UnauthorizedException("You are not authorized to update this paymentAccount")

    return updated
  }
  async delete(id: string, requestId: string, role: string): Promise<DeleteResult> {
    const deleted = await PaymentAccount.findById(id)
    //if the paymentAccount is not found, throw an error
    if (!deleted) throw new ObjectModelNotFoundException("Payment account not found")
    //if the paymentAccount is the default paymentAccount, throw an error
    if (deleted.isDefault) throw new UnauthorizedException("You can't delete the default payment account")
    //if the paymentAccount is not the paymentAccount of the customer, throw an error
    if (deleted.customer.toString() !== requestId && role === ERole.CUSTOMER)
      throw new UnauthorizedException("You are not authorized to delete this paymentAccount")

    return deleted.deleteOne()
  }
  async getCustomerPaymentAccounts(customerId: string): Promise<IPaymentAccount[]> {
    const paymentAccounts = await PaymentAccount.find({ customer: customerId }).lean()
    return paymentAccounts
  }

  async setDefaultPaymentAccount(paymentAccountId: string, requestId: string, role: string): Promise<IPaymentAccount> {
    //find the default paymentAccount of the customer in database
    const defaultPaymentAccount = await PaymentAccount.findOne({ customer: requestId, isDefault: true })

    //find the new default paymentAccount in database
    const newDefaultPaymentAccount = await PaymentAccount.findById(paymentAccountId)
    //if the new default paymentAccount is not found, throw an error
    if (!newDefaultPaymentAccount) throw new ObjectModelNotFoundException("Payment account not found")

    //if the customer has a default paymentAccount, change the default paymentAccount to false
    if (defaultPaymentAccount) {
      defaultPaymentAccount.isDefault = false
      await defaultPaymentAccount.save()
    }

    //if the new default paymentAccount is not the paymentAccount of the customer, throw an error
    if (newDefaultPaymentAccount.customer.toString() !== requestId && role === ERole.CUSTOMER)
      throw new UnauthorizedException("You are not authorized to set this payment account as default")

    //set the new default paymentAccount
    newDefaultPaymentAccount.isDefault = true
    return await newDefaultPaymentAccount.save()
  }
}
