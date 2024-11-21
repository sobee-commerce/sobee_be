import { Credential, Staff, User } from "@/models"
import { AuthService } from "../auth"
import { CreateStaffRequest, CreateStaffResponse } from "./dto"
import { StaffRepository } from "./staff.repository"
import { IStaff, IUser } from "@/interface"
import { ObjectModelNotFoundException, UserAlreadyExistsException } from "@/common/exceptions"
import { DeleteResult } from "mongodb"
import { hashPassword } from "@/common/utils"
import { ERole } from "@/enum"

export class StaffService implements StaffRepository {
  private authService: AuthService

  constructor() {
    this.authService = new AuthService()
  }

  async getAll(): Promise<IUser<IStaff>[]> {
    return await User.find(
      {
        role: ERole.STAFF
      },
      {},
      {
        populate: {
          path: "_user",
          populate: {
            path: "staffRole",
            select: "role_name"
          }
        }
      }
    )
  }
  async getOne<T = string>(key: keyof IUser<IStaff>, value: T): Promise<IUser<IStaff>> {
    const staff = await User.findOne(
      { [key]: value },
      {},
      {
        populate: {
          path: "_user",
          populate: {
            path: "staffRole"
          }
        }
      }
    )

    if (!staff) {
      throw new ObjectModelNotFoundException()
    }

    return staff as IUser<IStaff>
  }

  async create(req: CreateStaffRequest): Promise<CreateStaffResponse> {
    const { staffRole, identityCard, phoneNumber, email, password } = req
    const user = await User.findOne({ $or: [{ phoneNumber }, { email }] })

    if (user) {
      throw new UserAlreadyExistsException()
    }

    const newUser = new User(req)

    const hashedPassword = await hashPassword(password!)

    const newCredential = new Credential({
      userId: newUser._id,
      password: hashedPassword
    })

    const staff = new Staff({ staffRole, identityCard })
    newUser._user = staff._id

    await newCredential.save()
    await newUser.save()
    await staff.save()

    return newUser as CreateStaffResponse
  }

  async update(
    staffId: string,
    req: IUser<IStaff> & {
      oldPassword?: string
      newPassword?: string
    }
  ): Promise<IUser<IStaff>> {
    delete req._id
    const staff = await User.findByIdAndUpdate(staffId, { $set: req }, { new: true })

    if (!staff) {
      throw new ObjectModelNotFoundException()
    }

    const _staff = await Staff.findByIdAndUpdate(staff._user, { $set: req }, { new: true })

    if (!_staff) {
      throw new ObjectModelNotFoundException()
    }

    if (req.oldPassword && req.newPassword) {
      await this.authService.changePassword({
        userId: staff._id.toString(),
        oldPassword: req.oldPassword,
        newPassword: req.newPassword
      })
    }

    return staff as IUser<IStaff>
  }

  async delete(staffId: string): Promise<DeleteResult> {
    const staff = await User.findById(staffId)

    if (!staff) {
      throw new ObjectModelNotFoundException()
    }

    await Staff.findByIdAndDelete(staff._user)

    return await staff.deleteOne()
  }
}
