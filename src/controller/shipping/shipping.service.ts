import { IShipping } from "@/interface"
import { DeleteResult } from "mongodb"
import { ShippingRepository } from "./shipping.repository"
import { Shipping } from "@/models"
import { ObjectModelNotFoundException, ObjectModelOperationException } from "@/common/exceptions"
import { UpdateShippingRequest, UpdateShippingResponse } from "./dto"

export class ShippingService implements ShippingRepository {
  async create(data: IShipping): Promise<IShipping> {
    return await Shipping.create(data)
  }
  async getAll(): Promise<IShipping[]> {
    return await Shipping.find()
  }
  async getOne<T = string>(key: keyof IShipping, value: T): Promise<IShipping> {
    const shipping = await Shipping.findOne({ [key]: value })
    if (!shipping) {
      throw new ObjectModelNotFoundException("Shipping not found")
    }
    return shipping
  }
  async update(id: string, data: UpdateShippingRequest): Promise<UpdateShippingResponse> {
    const shipping = await Shipping.findByIdAndUpdate(id, { $set: data }, { new: true })
    if (!shipping) {
      throw new ObjectModelOperationException("Shipping not found")
    }
    return shipping
  }
  async delete(id: string): Promise<DeleteResult> {
    const shipping = await Shipping.findById(id)
    if (!shipping) {
      throw new ObjectModelOperationException("Shipping not found")
    }
    return await shipping.deleteOne()
  }
}
