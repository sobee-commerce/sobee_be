import { Types } from "mongoose"
import { UpdateUserInfoRequest, UpdateUserInfoResponse } from "./dto"
import { UserRepository } from "./user.repository"
import { User } from "@/models"
import { ObjectModelNotFoundException } from "@/common/exceptions"

export class UserService implements UserRepository {
  async updateUserInfo(id: Types.ObjectId | string, req: UpdateUserInfoRequest): Promise<UpdateUserInfoResponse> {
    const updatedUser = await User.findByIdAndUpdate(id, { $set: req }, { new: true })
    if (!updatedUser) {
      throw new ObjectModelNotFoundException("User not found")
    }
    return updatedUser
  }

  async changeUserAvatar(id: Types.ObjectId | string, avatar: string): Promise<UpdateUserInfoResponse> {
    const user = await User.findByIdAndUpdate(
      id,
      {
        $set: {
          avatar
        }
      },
      {
        new: true
      }
    )
    if (!user) {
      throw new ObjectModelNotFoundException("User not found")
    }
    return user.toJSON()
  }
}
