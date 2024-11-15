import { Socket } from "socket.io"
import { socketAsyncHandler } from "./socketAsyncHandler"

export default function handleSocketAPI({
  socket,
  clientEventName,
  serverEventName,
  middlewares,
  handler
}: {
  socket: Socket
  clientEventName: string
  serverEventName?: string
  middlewares?: any[]
  handler: any
}) {
  socket.on(
    clientEventName,
    socketAsyncHandler({
      socket,
      serverEventName,
      serverEvent: handler,
      middlewares
    })
  )
}
