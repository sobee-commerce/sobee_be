import { IShipping } from "@/interface"
import { CreateShippingRequest, CreateShippingResponse, UpdateShippingRequest, UpdateShippingResponse } from "./dto"
import { DeleteResult } from "mongodb"

export abstract class ShippingRepository {
  abstract create(data: CreateShippingRequest): Promise<CreateShippingResponse>
  abstract getAll(): Promise<Array<CreateShippingResponse>>
  abstract getOne<T = string>(key: string, value: T): Promise<IShipping>
  abstract update(id: string, data: UpdateShippingRequest): Promise<UpdateShippingResponse>
  abstract delete(id: string): Promise<DeleteResult>
}
