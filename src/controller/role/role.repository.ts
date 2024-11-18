import { IRole } from "@/interface"
import { CreateRoleRequest, CreateRoleResponse } from "./dto"

export abstract class RoleRepository {
  abstract create(req: IRole): Promise<IRole>
  abstract getAll(): Promise<Array<IRole>>
}
