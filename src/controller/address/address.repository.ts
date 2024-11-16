import { IAddress } from "@/interface"
import { CreateAddressRequest, CreateAddressResponse } from "./dto"
import { DeleteResult } from "mongodb"

export abstract class AddressRepository {
  abstract create(req: CreateAddressRequest): Promise<CreateAddressResponse>
  abstract update(id: string, data: Partial<IAddress>, requestId: string, role: string): Promise<IAddress>
  abstract delete(id: string, requestId: string, role: string): Promise<DeleteResult>
  abstract getCustomerAddresses(customerId: string, requestId: string, role: string): Promise<IAddress[]>
  abstract setDefaultAddress(addressId: string, requestId: string, role: string): Promise<IAddress>
}
