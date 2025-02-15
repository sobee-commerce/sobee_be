import { SOCKET_CLIENT_MESSAGE, SOCKET_SERVER_MESSAGE } from "@/common/constants/socket"
import handleSocketAPI from "@/common/helpers/handleSocketAPI"
import { BadRequestResponse, SuccessfulResponse } from "@/common/utils"
import { sendMail } from "@/common/utils/mailer"
import { UserService } from "@/controller"
import { NotificationService } from "@/controller/notification/notification.service"
import { IChatMessage } from "@/interface"
import { ChatRoom } from "@/models"
import { Socket } from "socket.io"

export default function createChatMessage(socket: Socket) {
  const userService = new UserService()
  handleSocketAPI({
    socket,
    clientEventName: SOCKET_CLIENT_MESSAGE.CREATE_CHAT_MESSAGE,
    middlewares: [],
    handler: async ({ chatRoomId, message }: { chatRoomId: string; message: string }) => {
      console.log("message", message, chatRoomId)
      if (!chatRoomId || !message) throw new BadRequestResponse("Chat room and message are required")
      const chatRoom = await ChatRoom.findById(chatRoomId)
      if (!chatRoom) throw new BadRequestResponse("Chat room not found")

      const customer = chatRoom.customer.user.toString()
      const staff = chatRoom.staff.user.toString()

      const newMessage = {
        content: message
      } as IChatMessage

      newMessage.sender = socket.data.userId === customer ? customer : staff
      newMessage.receiver = socket.data.userId === customer ? staff : customer

      newMessage.createdAt = new Date()
      newMessage.updatedAt = new Date()

      chatRoom.lastMessage = newMessage

      chatRoom.messages.push(newMessage)
      chatRoom.isHaveNew = true
      await chatRoom.save()

      socket.in(`room-chat-${chatRoomId}`).emit(SOCKET_SERVER_MESSAGE.NEW_CHAT_MESSAGE, {
        chatRoomId,
        message: chatRoom.messages[chatRoom.messages.length - 1]
      })

      const user = await userService.getUserById(newMessage.receiver)

      sendMail({
        to: user.email,
        subject: "New message",
        text: message
      })

      if (user.fcmToken) {
        NotificationService.sendNotification({
          token: user.fcmToken,
          notification: {
            title: "New message",
            body: message
          },
          android: {
            notification: {
              title: "New message",
              body: message
            },
            data: {
              chatRoomId
            }
          }
        })
      }

      return new SuccessfulResponse(
        chatRoom.messages[chatRoom.messages.length - 1],
        200,
        "Chat message created"
      ).fromSocket(socket, SOCKET_SERVER_MESSAGE.CREATE_CHAT_MESSAGE_RESULT)
    }
  })
}
