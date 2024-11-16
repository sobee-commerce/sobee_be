import { ITax } from "@/interface"
import { CreateTaxRequest, CreateTaxResponse, UpdateTaxRequest, UpdateTaxResponse } from "./dto"
import { DeleteResult } from "mongodb"

export abstract class TaxRepository {
  abstract create(data: CreateTaxRequest): Promise<CreateTaxResponse>
  abstract getAll(): Promise<Array<CreateTaxResponse>>
  abstract getOne<T = string>(key: string, value: T): Promise<ITax>
  abstract update(id: string, data: UpdateTaxRequest): Promise<UpdateTaxResponse>
  abstract delete(id: string): Promise<DeleteResult>
}
