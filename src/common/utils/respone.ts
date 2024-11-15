import { IFinalResponse } from "@/interface"
import { Response } from "express"
import { Socket } from "socket.io"
import { SOCKET_SERVER_MESSAGE } from "../constants/socket"
import { paginate } from "./paginate"

class SuccessfulResponse<T> implements IFinalResponse<T> {
  success: boolean
  data: T
  statusCode: number
  message?: string
  constructor(data: T, statusCode: number = 200, message?: string) {
    this.data = data
    this.success = true
    this.statusCode = statusCode
    this.message = message || "Success"
  }

  from(res: Response): void {
    res.status(this.statusCode).json({
      success: this.success,
      statusCode: this.statusCode,
      message: this.message,
      data: this.data
    })
  }

  fromSocket(socket: Socket, eventName = SOCKET_SERVER_MESSAGE.SUCCESS): void {
    socket.emit(eventName, {
      success: true,
      statusCode: this.statusCode,
      message: this.message,
      data: this.data
    })
  }

  async withPagination(res: Response, page: number, limit: number, total: number): Promise<void> {
    const paginationRes = await paginate(page, limit, total)
    res.status(this.statusCode).json({
      success: this.success,
      statusCode: this.statusCode,
      message: this.message,
      data: this.data,
      ...paginationRes
    })
  }
}

class ErrorResponse<T> extends Error implements IFinalResponse<T> {
  success: boolean
  statusCode: number
  message: string
  constructor(statusCode: number = 500, message: string) {
    super(message)
    this.success = false
    this.statusCode = statusCode
    this.message = message || "Error"
  }

  from(res: Response): void {
    res.status(this.statusCode).json({
      success: this.success,
      statusCode: this.statusCode,
      message: this.message
    })
  }

  fromSocket(socket: Socket): void {
    socket.emit(SOCKET_SERVER_MESSAGE.ERROR, {
      success: false,
      statusCode: this.statusCode,
      message: this.message
    })
  }
}

class UnauthorizedResponse<T> extends ErrorResponse<T> {
  constructor(message: string = "Unauthorized") {
    super(401, message)
  }
}

class ForbiddenResponse<T> extends ErrorResponse<T> {
  constructor(message: string = "Forbidden") {
    super(403, message)
  }
}

class NotFoundResponse<T> extends ErrorResponse<T> {
  constructor(message: string = "Not found") {
    super(404, message)
  }
}

class BadRequestResponse<T> extends ErrorResponse<T> {
  constructor(message: string = "Bad request") {
    super(400, message)
  }
}

class ConflictResponse<T> extends ErrorResponse<T> {
  constructor(message: string = "Conflict") {
    super(409, message)
  }
}

export {
  SuccessfulResponse,
  ErrorResponse,
  UnauthorizedResponse,
  ForbiddenResponse,
  NotFoundResponse,
  BadRequestResponse,
  ConflictResponse
}
