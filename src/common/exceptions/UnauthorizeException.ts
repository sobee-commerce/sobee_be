import { IException } from "@/interface"
import { HttpStatusCode } from "../utils"

class UnauthorizedException extends Error implements IException {
  statusCode: number

  toJSON(): { statusCode: number; message: string } {
    return {
      statusCode: this.statusCode,
      message: this.message
    }
  }

  constructor(message: string = "Unauthorized") {
    super(message)
    this.name = "UnauthorizedException"
    this.statusCode = HttpStatusCode.UNAUTHORIZED
  }
}

export { UnauthorizedException }
