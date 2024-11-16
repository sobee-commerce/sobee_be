import { Response } from "express"
import { Socket } from "socket.io"

export interface IResponse<T> {
  success: boolean
  statusCode: number
  data?: T
  message?: string
}

export interface IFinalResponse<T> extends IResponse<T> {
  from(res: Response): void
  fromSocket(socket: Socket, eventName?: string): void
}
