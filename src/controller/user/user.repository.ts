import { Types } from "mongoose"
import { UpdateUserInfoRequest, UpdateUserInfoResponse } from "./dto"

export abstract class UserRepository {
  abstract updateUserInfo(id: Types.ObjectId | string, req: UpdateUserInfoRequest): Promise<UpdateUserInfoResponse>
}
