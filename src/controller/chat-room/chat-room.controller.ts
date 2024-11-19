import { IRoute } from "@/interface"
import { ChatRoomService } from "./chat-room.service"
import { Request, Response, Router } from "express"
import { HttpStatusCode, SuccessfulResponse, asyncHandler } from "@/common/utils"
import middleware from "@/common/middleware"

export class ChatRoomController implements IRoute {
  private readonly router: Router
  private readonly path: string

  private readonly PATHS = {
    ROOT: "/",
    USER: "/user",
    ROOM: "/:roomId"
  }

  private static readonly chatRoomService = new ChatRoomService()

  constructor(path = "/api/chat-room") {
    this.router = Router()
    this.router.use(middleware.verifyToken)
    this.path = path
    this.initializeRoutes()
  }

  private initializeRoutes(): void {
    this.router.get(this.PATHS.USER, asyncHandler(this.getRoomsByUser))
    this.router.get(this.PATHS.ROOM, asyncHandler(this.getRoomById))
  }

  async getRoomsByUser(req: Request, res: Response) {
    const data = await ChatRoomController.chatRoomService.getRoomsByUser(req.userId)
    new SuccessfulResponse(data, HttpStatusCode.OK, "Get list room chat successfully").from(res)
  }

  private async getRoomById(req: Request, res: Response) {
    const data = await ChatRoomController.chatRoomService.getRoomById(req.params.roomId)
    new SuccessfulResponse(data, HttpStatusCode.OK, "Get room chat successfully").from(res)
  }

  getPath(): string {
    return this.path
  }

  getRouter(): Router {
    return this.router
  }
}
