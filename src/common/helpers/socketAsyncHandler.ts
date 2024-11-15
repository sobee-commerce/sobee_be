import { Socket } from "socket.io"
import { SOCKET_SERVER_MESSAGE } from "../constants/socket"
import { ErrorResponse } from "../utils"

export const socketErrorHandler =
  (socket: Socket, eventName = SOCKET_SERVER_MESSAGE.ERROR) =>
  (error: any) => {
    return new ErrorResponse(error.statusCode || 500, error.message).fromSocket(socket)
  }

type MiddlewareFunction = (socket: Socket, data: any) => any
type HandlerFunction = (data: any) => Promise<any>

export const socketAsyncHandler =
  ({
    socket,
    serverEventName,
    serverEvent,
    middlewares = []
  }: {
    socket: Socket
    serverEventName?: string
    serverEvent?: HandlerFunction
    middlewares?: MiddlewareFunction[]
  }) =>
  async (data: any) => {
    // if (typeof serverEvent != "string") func = [serverEvent, ...func]
    // const middlewares = func.slice(0, func.length - 1)
    // const execution = func.at(-1) as HandlerFunction

    try {
      middlewares.length > 0 &&
        (await Promise.all(middlewares.map(async (middleware) => await middleware?.(socket, data))))
      serverEvent && (await serverEvent(data))
    } catch (error: any) {
      socketErrorHandler(socket, serverEventName ? serverEventName : SOCKET_SERVER_MESSAGE.ERROR)(error)
    }
  }
