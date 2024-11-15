import { SOCKET_CLIENT_MESSAGE } from "@/common/constants/socket"
import { socketAsyncHandler } from "@/common/helpers/socketAsyncHandler"
import { BadRequestResponse, SuccessfulResponse } from "@/common/utils"
import { NotificationService } from "@/controller"
import { ENotificationType } from "@/enum"
import { Socket } from "socket.io"
import handleChat from "./chat"
import userSocketList from "./chat/userSocketList"

export default function getSocketRoutes(socket: Socket) {
  handleChat(socket)

  const notificationService = new NotificationService()

  socket.on("push-notification", (data) => {
    console.log(`User ${socket.id} pushed a notification`)
    notificationService.push(data)
  })

  //ping test route for testing connection between client and server socket
  socket.on(
    SOCKET_CLIENT_MESSAGE.PING,
    socketAsyncHandler({
      socket,
      serverEvent: async (data: { text: string }) => {
        if (data.text !== "OK") throw new BadRequestResponse("Text is not OK")
        console.log(userSocketList.getUserList())

        return new SuccessfulResponse(
          { text: "Pong", user: Object.fromEntries(userSocketList.getUserList()) },
          200,
          "Connection is ok"
        ).fromSocket(socket, "pong")
      }
    })
  )

  socket.on(SOCKET_CLIENT_MESSAGE.DISCONNECT, () => {
    console.log(`User ${socket.id} disconnected`)
    userSocketList.removeSocket(socket.data.userId)
    socket.emit("push-notification", {
      type: ENotificationType.INFO,
      content: `User ${socket.id} disconnected`,
      redirectUrl: "http://localhost:3000",
      title: "User disconnected"
    })
  })
}
