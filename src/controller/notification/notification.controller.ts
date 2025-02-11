import middleware from "@/common/middleware"
import { ERole } from "@/enum"
import { INotification, IRoute } from "@/interface"
import { Request, Response, Router } from "express"
import { NotificationService } from "./notification.service"
import { UserService } from "../user"
import { asyncHandler, HttpStatusCode, SuccessfulResponse } from "@/common/utils"
import { sendMail } from "@/common/utils/mailer"

export class NotificationController implements IRoute {
  private readonly router: Router
  private readonly path: string

  private static readonly userService: UserService = new UserService()

  private readonly PATHS = {
    ROOT: "/",
    PUSH: "/push",
    SAVE_TOKEN: "/save-token",
    ID: "/:id"
  }

  constructor(path = "/api/notification") {
    this.router = Router()
    this.path = path
    this.router.use(middleware.verifyToken)
    this.initializeRoutes()
  }

  private initializeRoutes(): void {
    this.router.post(
      this.PATHS.PUSH,
      middleware.mustHaveFields<INotification>("content", "title", "type"),
      middleware.verifyRoles(ERole.ADMIN),
      asyncHandler(this.pushNotificationToAll)
    )
    this.router.post(this.PATHS.SAVE_TOKEN, middleware.mustHaveFields("fcmToken"), asyncHandler(this.saveToken))
    this.router.get(this.PATHS.ROOT, asyncHandler(this.getAllNotifications))
    this.router.delete(this.PATHS.ID, asyncHandler(this.deleteNotification))
  }

  private async getAllNotifications(req: Request, res: Response): Promise<void> {
    const notifications = await NotificationService.getAllNotifications()
    new SuccessfulResponse(notifications, HttpStatusCode.OK, "Get all notifications successfully").from(res)
  }

  private async deleteNotification(req: Request, res: Response): Promise<void> {
    const { id } = req.params
    const notification = await NotificationService.deleteNotification(id)
    new SuccessfulResponse(notification, HttpStatusCode.OK, "Delete notification successfully").from(res)
  }

  private async pushNotificationToAll(req: Request, res: Response): Promise<void> {
    const { title, content, redirectUrl, type, imageUrl } = req.body as INotification
    const tokens = await NotificationController.userService.getUsersFcmToken()
    const emails = await NotificationController.userService.getCustomersEmail()

    const data = {
      title,
      body: content,
      type
    }

    const notificationData = {
      title,
      body: content
    }

    if (imageUrl) {
      data["imageUrl"] = imageUrl
      notificationData["imageUrl"] = imageUrl
    }
    if (redirectUrl) {
      data["redirectUrl"] = redirectUrl
    }

    const notification = await NotificationService.sendMulticastNotification({
      data,
      notification: notificationData,
      android: {
        notification: notificationData,
        collapseKey: "com.sobee_app",
        priority: "high",
        data
      },
      tokens
    })

    emails.forEach((email) => {
      sendMail({
        to: email,
        subject: title,
        text: content
      })
    })

    new SuccessfulResponse(notification, HttpStatusCode.OK, "Push notification successfully").from(res)
  }

  private async saveToken(req: Request, res: Response): Promise<void> {
    const { fcmToken } = req.body
    const user = await NotificationController.userService.saveFcmToken(req.userId, fcmToken)
    new SuccessfulResponse(user, HttpStatusCode.OK, "Save fcm token successfully").from(res)
  }

  getPath(): string {
    return this.path
  }

  getRouter(): Router {
    return this.router
  }
}
