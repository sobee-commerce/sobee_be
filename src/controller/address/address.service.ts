import { IAddress } from "@/interface"
import { AddressRepository } from "./address.repository"
import { Address } from "@/models"
import { ObjectModelNotFoundException, UnauthorizedException } from "@/common/exceptions"
import { ERole } from "@/enum"
import { DeleteResult } from "mongodb"

export class AddressService implements AddressRepository {
  async create(req: IAddress): Promise<IAddress> {
    const newAddress = new Address(req)

    //find the default address of the customer in database
    const defaultAddress = await Address.findOne({ customer: req.customer, isDefault: true })

    //if the customer has no default address, create the new address as default
    if (!defaultAddress) {
      newAddress.isDefault = true
      return await newAddress.save()
    }

    //if the customer has a default address, and req.isDefault is true, change the default address to not default
    if (req.isDefault === true) {
      defaultAddress.isDefault = false
      await defaultAddress.save()
    }

    //create the new address
    return await newAddress.save()
  }
  async update(id: string, data: Partial<IAddress>, requestId: string, role: string): Promise<IAddress> {
    //if data.isDefault is true
    if (data.isDefault === true) {
      //find the default address of the customer in database
      const defaultAddress = await Address.findOne({ customer: requestId, isDefault: true })
      //if the customer has a default address, change the default address to false
      if (defaultAddress) {
        defaultAddress.isDefault = false
        await defaultAddress.save()
      }
    }

    const updated = await Address.findByIdAndUpdate(id, { $set: data }, { new: true }).lean()
    //if the address is not found, throw an error
    if (!updated) throw new ObjectModelNotFoundException("Address not found")
    //if the address is not the address of the customer, throw an error
    if (updated.customer.toString() !== requestId && role === ERole.CUSTOMER)
      throw new UnauthorizedException("You are not authorized to update this address")

    return updated
  }
  async delete(id: string, requestId: string, role: string): Promise<DeleteResult> {
    const deleted = await Address.findById(id)
    //if the address is not found, throw an error
    if (!deleted) throw new ObjectModelNotFoundException("Address not found")
    //if the address is the default address, throw an error
    if (deleted.isDefault) throw new UnauthorizedException("You can't delete the default address")
    //if the address is not the address of the customer, throw an error
    if (deleted.customer.toString() !== requestId && role === ERole.CUSTOMER)
      throw new UnauthorizedException("You are not authorized to delete this address")

    return deleted.deleteOne()
  }
  async getCustomerAddresses(customerId: string): Promise<IAddress[]> {
    const addresses = await Address.find({ customer: customerId }).lean()
    return addresses
  }

  async setDefaultAddress(addressId: string, requestId: string, role: string): Promise<IAddress> {
    //find the default address of the customer in database
    const defaultAddress = await Address.findOne({ customer: requestId, isDefault: true })

    //find the new default address in database
    const newDefaultAddress = await Address.findById(addressId)
    //if the new default address is not found, throw an error
    if (!newDefaultAddress) throw new ObjectModelNotFoundException("Address not found")

    //if the customer has a default address, change the default address to false
    if (defaultAddress) {
      defaultAddress.isDefault = false
      await defaultAddress.save()
    }

    //if the new default address is not the address of the customer, throw an error
    if (newDefaultAddress.customer.toString() !== requestId && role === ERole.CUSTOMER)
      throw new UnauthorizedException("You are not authorized to set this address as default")

    //set the new default address
    newDefaultAddress.isDefault = true
    return await newDefaultAddress.save()
  }
}
