import { IException } from "@/interface"

class InvalidRoleException extends Error implements IException {
  statusCode: number

  toJSON(): { statusCode: number; message: string } {
    return {
      statusCode: this.statusCode,
      message: this.message
    }
  }

  constructor(message: string = "Invalid Role") {
    super(message)
    this.name = "InvalidRoleException"
    this.statusCode = 400
  }
}

export { InvalidRoleException }
