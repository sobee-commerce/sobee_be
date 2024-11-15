import { SOCKET_CLIENT_MESSAGE, SOCKET_SERVER_MESSAGE } from "@/common/constants/socket"
import handleSocketAPI from "@/common/helpers/handleSocketAPI"
import { SuccessfulResponse } from "@/common/utils"
import { ChatRoomService } from "@/controller"
import { Socket } from "socket.io"
import userSocketList from "./userSocketList"

export default function createChatRoom(socket: Socket) {
  handleSocketAPI({
    socket,
    clientEventName: SOCKET_CLIENT_MESSAGE.CREATE_CHAT,
    middlewares: [],
    handler: async ({ orderId, productId }: { orderId?: string; productId?: string }) => {
      const chatRoomService = new ChatRoomService()
      const userId = socket.data.userId
      const chatRoom = await chatRoomService.create(orderId!, userId)

      socket.join(`room-chat-${chatRoom._id.toString()}`)

      if (userSocketList.getSocket(userId)) {
        socket.to(userSocketList.getSocket(userId)).emit(SOCKET_SERVER_MESSAGE.NEW_CHAT_ROOM, chatRoom)
      }

      return new SuccessfulResponse(chatRoom, 200, "Chat room created").fromSocket(
        socket,
        SOCKET_SERVER_MESSAGE.CREATE_CHAT_RESULT
      )
    }
  })
}
