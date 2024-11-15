import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import { Types } from "mongoose"

export const verifyToken = (token: string, secretKey: string) => {
  return jwt.verify(token, secretKey)
}

export const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(10)
  return await bcrypt.hash(password, salt)
}

export const comparePassword = async (password: string, hash: string) => {
  return await bcrypt.compare(password, hash)
}

export const createTokenPair = async (
  payload: string | object | Buffer,
  publicKey: string,
  privateKey: string
): Promise<{ accessToken: string; refreshToken: string }> => {
  return new Promise((resolve, reject) => {
    jwt.sign(payload, publicKey, { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || "2 days" }, (err, accessToken) => {
      if (accessToken == undefined || err) {
        reject(err)
        throw new Error("Failed to create access token")
      }
      jwt.sign(
        payload,
        privateKey,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "7 days" },
        (err, refreshToken) => {
          if (refreshToken == undefined || err) {
            reject(err)
            throw new Error("Failed to create refresh token")
          }
          resolve({ accessToken, refreshToken })
        }
      )
    })
  })
  // const accessToken = jwt.sign(payload, publicKey, {
  //     expiresIn: "2 days"
  // })
  // const refreshToken = jwt.sign(payload, privateKey, {
  //     expiresIn: "7 days"
  // })

  // return { accessToken, refreshToken }
}

export const createKeyPair = () => {
  const publicKey = crypto.randomBytes(64).toString("hex")
  const privateKey = crypto.randomBytes(64).toString("hex")

  return { publicKey, privateKey }
}

const removeSpecialCharacter = (str: string) =>
  // eslint-disable-next-line no-useless-escape
  str.replace(/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g, "")

export const SPLIT_ID_PATTERN = "_id-"

export const generateNameId = ({ name, id }: { name: string; id: string }) => {
  return removeSpecialCharacter(name).replace(/\s/g, "-") + `${SPLIT_ID_PATTERN}${id}`
}

export const stringToObjectId = (str: string) => {
  return new Types.ObjectId(str)
}

export const getIdFromNameId = (nameId: string) => {
  const arr = nameId.split(SPLIT_ID_PATTERN)
  return arr[arr.length - 1]
}

export const generateOrderId = () => {
  const date = new Date()
  const year = date.getFullYear().toString().substring(2)
  const month = (date.getMonth() + 1).toString().padStart(2, "0")
  const day = date.getDate().toString().padStart(2, "0")
  const hours = date.getHours().toString().padStart(2, "0")
  const minutes = date.getMinutes().toString().padStart(2, "0")
  const seconds = date.getSeconds().toString().padStart(2, "0")
  const milliseconds = date.getMilliseconds().toString().padStart(3, "0")
  return `#${year}${month}${day}${hours}${minutes}${seconds}${milliseconds}`
}

console.log(generateOrderId())
