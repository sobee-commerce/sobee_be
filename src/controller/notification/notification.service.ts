import { messaging } from "@/common/utils/firebase"
import { INotification } from "@/interface"
import { Notification } from "@/models"
import { Message, MulticastMessage } from "firebase-admin/lib/messaging/messaging-api"

export class NotificationService {
  private static readonly messaging = messaging

  static async sendNotification(data: Message): Promise<void> {
    await this.messaging.send(data)
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

    await this.messaging.sendEachForMulticast(data).then(async (response) => {
      if (response.failureCount > 0) {
        return
      }

      await notification.save()
    })

    return notification
  }
}
