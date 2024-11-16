import { ITax } from "@/interface"
import { DeleteResult } from "mongodb"
import { TaxRepository } from "./tax.repository"
import { Tax } from "@/models"
import { ObjectModelNotFoundException, ObjectModelOperationException } from "@/common/exceptions"
import { UpdateTaxRequest, UpdateTaxResponse } from "./dto"

export class TaxService implements TaxRepository {
  async create(data: ITax): Promise<ITax> {
    return await Tax.create(data)
  }
  async getAll(): Promise<ITax[]> {
    return await Tax.find()
  }
  async getOne<T = string>(key: keyof ITax, value: T): Promise<ITax> {
    const tax = await Tax.findOne({ [key]: value })
    if (!tax) {
      throw new ObjectModelNotFoundException("Tax not found")
    }
    return tax
  }
  async update(id: string, data: UpdateTaxRequest): Promise<UpdateTaxResponse> {
    const tax = await Tax.findByIdAndUpdate(id, { $set: data }, { new: true })
    if (!tax) {
      throw new ObjectModelOperationException("Tax not found")
    }
    return tax
  }
  async delete(id: string): Promise<DeleteResult> {
    const tax = await Tax.findById(id)
    if (!tax) {
      throw new ObjectModelOperationException("Tax not found")
    }
    return await tax.deleteOne()
  }
}
