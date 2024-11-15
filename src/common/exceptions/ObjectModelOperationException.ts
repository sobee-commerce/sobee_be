import { IException } from "@/interface"
import { HttpStatusCode } from "../utils"

class ObjectModelOperationException extends Error implements IException {
  statusCode: number

  toJSON(): { statusCode: number; message: string } {
    return {
      statusCode: this.statusCode,
      message: this.message
    }
  }

  constructor(message: string = "Error performing operation on object model") {
    super(message)
    this.name = "ObjectModelOperationException"
    this.statusCode = HttpStatusCode.BAD_REQUEST
  }
}

export { ObjectModelOperationException }
