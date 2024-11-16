import { ICard } from "@/interface"
import { DeleteResult } from "mongodb"

export abstract class CardRepository {
  abstract create(req: ICard): Promise<ICard>
  abstract update(id: string, data: Partial<ICard>, requestId: string, role: string): Promise<ICard>
  abstract delete(id: string, requestId: string, role: string): Promise<DeleteResult>
  abstract getCustomerCards(customerId: string): Promise<ICard[]>
  abstract setDefaultCard(cardId: string, requestId: string, role: string): Promise<ICard>
}
