import KeyToken from "@/models/KeyToken"
import { Types } from "mongoose"

class KeyTokenService {
  static createKeyToken = async ({
    userId,
    publicKey,
    privateKey,
    refreshToken
  }: {
    userId: Types.ObjectId | string
    publicKey: string
    privateKey: string
    refreshToken: string
  }) => {
    const filter = { user: userId }
    const update = { publicKey, privateKey, refreshToken, refreshTokenUsed: [] }
    const options = { upsert: true, new: true }

    const token = await KeyToken.findOneAndUpdate(filter, update, options)

    if (!token) {
      throw new Error("Failed to create token")
    }
    return token
  }

  static findbyUserId = async (userId: string) => {
    return await KeyToken.findOne({ user: userId }).lean()
  }

  static removeKeyById = async (id: string | Types.ObjectId) => {
    return await KeyToken.findByIdAndDelete(id).lean()
  }

  static deleteByUserId = async (userId: string | Types.ObjectId) => {
    return await KeyToken.deleteOne({ user: userId })
  }
}

export default KeyTokenService
