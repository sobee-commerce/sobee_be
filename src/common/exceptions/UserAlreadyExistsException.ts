import { IException } from "@/interface"
import { HttpStatusCode } from "../utils"

class UserAlreadyExistsException extends Error implements IException {
  statusCode: number

  toJSON(): { statusCode: number; message: string } {
    return {
      statusCode: this.statusCode,
      message: this.message
    }
  }

  constructor(message: string = "User's already exists") {
    super(message)
    this.name = "UserAlreadyExistsException"
    this.statusCode = HttpStatusCode.BAD_REQUEST
  }
}

export { UserAlreadyExistsException }
