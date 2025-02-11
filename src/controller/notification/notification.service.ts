import { ObjectModelNotFoundException } from "@/common/exceptions"
import { messaging } from "@/common/utils/firebase"
import { INotification } from "@/interface"
import { Notification } from "@/models"
import { Message, MulticastMessage } from "firebase-admin/lib/messaging/messaging-api"

export class NotificationService {
  private static readonly messaging = messaging

  static async getAllNotifications() {
    return await Notification.find().sort({ createdAt: -1 })
  }

  static async deleteNotification(id: string) {
    const notification = await Notification.findByIdAndDelete(id)

    if (!notification) {
      throw new ObjectModelNotFoundException("Notification not found")
    }

    return notification
  }

  static async sendNotification(data: Message): Promise<void> {
    const notification = new Notification({
      content: data.notification?.body,
      title: data.notification?.title,
      imageUrl: data.data?.imageUrl,
      type: data.data?.type,
      redirectUrl: data.data?.redirectUrl,
      to: [(data as any).token]
    } as INotification)
    await this.messaging
      .send(data)
      .then(async () => {
        await notification.save()
      })
      .catch((error) => {
        console.log(error)
      })
  }

  static async sendMulticastNotification(data: MulticastMessage) {
    const notification = new Notification({
      content: data.notification?.body,
      title: data.notification?.title,
      imageUrl: data.data?.imageUrl,
      type: data.data?.type,
      redirectUrl: data.data?.redirectUrl,
      to: data.tokens
    } as INotification)

    if (data.tokens.length === 0) {
      return notification
    }

    await this.messaging
      .sendEachForMulticast(data)
      .then(async (response) => {
        if (response.failureCount > 0) {
          return
        }
      })
      .catch((error) => {
        console.log(error)
      })
    await notification.save()

    return notification
  }
}
