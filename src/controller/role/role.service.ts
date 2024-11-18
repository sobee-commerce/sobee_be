import { IGrantListItem, IRole } from "@/interface"
import { RoleRepository } from "./role.repository"
import { Role } from "@/models"
import { ObjectModelOperationException } from "@/common/exceptions"

export class RoleService implements RoleRepository {
  async create(req: IRole): Promise<IRole> {
    return await Role.create(req)
  }
  async update(req: IRole): Promise<Partial<IRole>> {
    const role = await Role.findOneAndUpdate(
      { role_name: req.role_name },
      {
        $set: {
          grant_lists: req.grant_lists
        },
        $inc: { __v: 1 }
      },
      { new: true }
    )

    if (!role) {
      throw new ObjectModelOperationException("Role not found")
    }
    return role
  }
  async getAll(): Promise<IRole[]> {
    return await Role.find()
  }

  async getOne(queryKey: keyof IRole, value: string): Promise<IRole> {
    const role = await Role.findOne({ [queryKey]: value })
    if (!role) {
      throw new ObjectModelOperationException("Role not found")
    }
    return role
  }

  async deleteResource(role_name: string, resource: string[]): Promise<IRole> {
    const role = await Role.findOne({ role_name })
    if (!role) {
      throw new ObjectModelOperationException("Role not found")
    }
    role.grant_lists = role.grant_lists.filter((grant) => !resource.includes(grant.resource))
    await role.save()
    return role
  }
  async delete(id: string): Promise<void> {
    const role = await Role.findOne({ _id: id })
    if (!role) {
      throw new ObjectModelOperationException("Role not found")
    }
    await role.deleteOne()
  }

  async getAllListRoles(): Promise<IGrantListItem[]> {
    const role = await Role.aggregate([
      {
        $unwind: "$grant_lists"
      },
      {
        $project: {
          role: "$role_name",
          resource: "$grant_lists.resource",
          action: "$grant_lists.actions",
          attributes: "$grant_lists.attributes"
        }
      },
      {
        $unwind: "$action"
      },
      {
        $project: {
          _id: 0,
          role: 1,
          resource: 1,
          action: 1,
          attributes: 1
        }
      }
    ])
    return role
  }
}
