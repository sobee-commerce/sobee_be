import { IStaff, IUser } from "@/interface"
import { CreateStaffRequest, CreateStaffResponse } from "./dto"
import { DeleteResult } from "mongodb"
export abstract class StaffRepository {
  abstract create(req: CreateStaffRequest): Promise<CreateStaffResponse>
  abstract update(staffId: string, req: IUser<IStaff>): Promise<IUser<IStaff>>
  abstract delete(staffId: string): Promise<DeleteResult>
  abstract getAll(): Promise<IUser<IStaff>[]>
  abstract getOne<T = string>(key: keyof IUser<IStaff>, value: T): Promise<IUser<IStaff>>
}
