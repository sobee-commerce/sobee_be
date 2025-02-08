import "express"
import { IKeyToken } from "@/interface/schema"

declare module "express" {
  export interface Request {
    userId: string
    role: string
    keyToken: IKeyToken
    staffRole?: string | object
    permission: boolean
  }
}
