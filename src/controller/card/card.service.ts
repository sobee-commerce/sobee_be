import { ICard } from "@/interface"
import { CardRepository } from "./card.repository"
import { PaymentCard } from "@/models"
import { ObjectModelNotFoundException, ObjectModelOperationException, UnauthorizedException } from "@/common/exceptions"
import { ERole } from "@/enum"
import { DeleteResult } from "mongodb"

export class CardService implements CardRepository {
  async create(req: ICard): Promise<ICard> {
    const card = await PaymentCard.findOne({ cardNumber: req.cardNumber, customer: req.customer })
    if (card) {
      throw new ObjectModelOperationException("Card already exists")
    }

    const newCard = new PaymentCard(req)

    //find the default card of the customer in database
    const defaultCard = await PaymentCard.findOne({ customer: req.customer, isDefault: true })

    //if the customer has no default card, create the new card as default
    if (!defaultCard) {
      newCard.isDefault = true
      return await newCard.save()
    }

    //if the customer has a default card, and req.isDefault is true, change the default card to not default
    if (req.isDefault === true) {
      defaultCard.isDefault = false
      await defaultCard.save()
    }

    //create the new card
    return await newCard.save()
  }
  async update(id: string, data: Partial<ICard>, requestId: string, role: string): Promise<ICard> {
    //if data.isDefault is true
    if (data.isDefault === true) {
      //find the default card of the customer in database
      const defaultCard = await PaymentCard.findOne({ customer: requestId, isDefault: true })
      //if the customer has a default card, change the default card to false
      if (defaultCard) {
        defaultCard.isDefault = false
        await defaultCard.save()
      }
    }

    const updated = await PaymentCard.findByIdAndUpdate(id, { $set: data }, { new: true }).lean()
    //if the card is not found, throw an error
    if (!updated) throw new ObjectModelNotFoundException("Card not found")
    //if the card is not the card of the customer, throw an error
    if (updated.customer.toString() !== requestId && role === ERole.CUSTOMER)
      throw new UnauthorizedException("You are not authorized to update this card")

    return updated
  }
  async delete(id: string, requestId: string, role: string): Promise<DeleteResult> {
    const deleted = await PaymentCard.findById(id)
    //if the card is not found, throw an error
    if (!deleted) throw new ObjectModelNotFoundException("Card not found")
    //if the card is the default card, throw an error
    if (deleted.isDefault) throw new UnauthorizedException("You can't delete the default card")
    //if the card is not the card of the customer, throw an error
    if (deleted.customer.toString() !== requestId && role === ERole.CUSTOMER)
      throw new UnauthorizedException("You are not authorized to delete this card")

    return deleted.deleteOne()
  }
  async getCustomerCards(customerId: string): Promise<ICard[]> {
    const cards = await PaymentCard.find({ customer: customerId }).lean()
    return cards
  }

  async setDefaultCard(cardId: string, requestId: string, role: string): Promise<ICard> {
    //find the default card of the customer in database
    const defaultCard = await PaymentCard.findOne({ customer: requestId, isDefault: true })

    //find the new default card in database
    const newDefaultCard = await PaymentCard.findById(cardId)
    //if the new default card is not found, throw an error
    if (!newDefaultCard) throw new ObjectModelNotFoundException("Card not found")

    //if the customer has a default card, change the default card to false
    if (defaultCard) {
      defaultCard.isDefault = false
      await defaultCard.save()
    }

    //if the new default card is not the card of the customer, throw an error
    if (newDefaultCard.customer.toString() !== requestId && role === ERole.CUSTOMER)
      throw new UnauthorizedException("You are not authorized to set this card as default")

    //set the new default card
    newDefaultCard.isDefault = true
    return await newDefaultCard.save()
  }
}
