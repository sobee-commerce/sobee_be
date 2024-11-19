import { IChatMessage } from "@/interface"
import { CreateChatMessageRequest, CreateChatMessageResponse } from "./dto"

export abstract class ChatMessageRepository {
  abstract create(req: CreateChatMessageRequest): Promise<CreateChatMessageResponse>
  abstract delete(id: string): Promise<IChatMessage>
}
