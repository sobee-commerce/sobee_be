import { Types } from "mongoose"

export const convertToObjectIdMongodb = (id: string) => {
  return new Types.ObjectId(id)
}
