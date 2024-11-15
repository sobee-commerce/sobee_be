import { IException } from "@/interface"
import { HttpStatusCode } from "../utils"

class ObjectModelNotFoundException extends Error implements IException {
  statusCode: number

  toJSON(): { statusCode: number; message: string } {
    return {
      statusCode: this.statusCode,
      message: this.message
    }
  }

  constructor(message: string = "Not found") {
    super(message)
    this.name = "ObjectModelNotFoundException"
    this.statusCode = HttpStatusCode.BAD_REQUEST
  }
}

export { ObjectModelNotFoundException }
