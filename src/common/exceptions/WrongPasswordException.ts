import { IException } from "@/interface"
import { HttpStatusCode } from "../utils"

class WrongPasswordException extends Error implements IException {
  statusCode: number

  toJSON(): { statusCode: number; message: string } {
    return {
      statusCode: this.statusCode,
      message: this.message
    }
  }

  constructor(message: string = "Wrong password") {
    super(message)
    this.name = "WrongPasswordException"
    this.statusCode = HttpStatusCode.BAD_REQUEST
  }
}

export { WrongPasswordException }
