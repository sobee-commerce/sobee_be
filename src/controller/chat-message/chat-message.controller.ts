import { IRoute } from "@/interface"
import { ChatMessageService } from "./chat-message.service"
import { Router } from "express"

export class ChatMessageController implements IRoute {
  private readonly router: Router
  private readonly path: string

  private readonly PATHS = {}

  private static readonly chatMessageService = new ChatMessageService()

  constructor(path = "/api/chat-message") {
    this.router = Router()
    this.path = path
    this.initializeRoutes()
  }

  private initializeRoutes(): void {}

  getPath(): string {
    return this.path
  }

  getRouter(): Router {
    return this.router
  }
}
