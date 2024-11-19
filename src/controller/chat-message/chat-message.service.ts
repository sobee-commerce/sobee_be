import { IChatMessage } from "@/interface"
import { ChatMessageRepository } from "./chat-message.repository"

import { ObjectModelNotFoundException } from "@/common/exceptions"

export class ChatMessageService implements ChatMessageRepository {
  async create(req: IChatMessage): Promise<IChatMessage> {
    throw new Error("Method not implemented.")
  }
  async delete(id: string): Promise<IChatMessage> {
    throw new Error("Method not implemented.")
    // const deleted = await ChatMessage.findByIdAndDelete(id)
    // if (!deleted) throw new ObjectModelNotFoundException()
    // return deleted
  }
}
