import { IQuestion, IReply } from "@/interface"
import { DeleteResult } from "mongodb"
import { QuestionRepository } from "./question.repository"
import { Question } from "@/models"
import { ObjectModelNotFoundException, ObjectModelOperationException } from "@/common/exceptions"
import { getIdFromNameId } from "@/common/utils"

export class QuestionService implements QuestionRepository {
  async create(data: IQuestion): Promise<IQuestion> {
    const processedSlug = getIdFromNameId(data.product! as string)
    const question = await Question.findOne({
      product: processedSlug,
      customer: data.customer
    })

    if (question) {
      throw new ObjectModelOperationException("You have already asked a question for this product")
    }

    return await Question.create({
      ...data,
      product: processedSlug
    })
  }
  async getAll(): Promise<IQuestion[]> {
    return await Question.find(
      {},
      {},
      {
        populate: [
          {
            path: "customer",
            select: "name avatar"
          },
          {
            path: "product",
            select: "name thumbnail"
          }
        ]
      }
    )
  }
  async getOne<T = string>(key: keyof IQuestion, value: T): Promise<IQuestion> {
    const question = await Question.findOne({ [key]: value })
    if (!question) {
      throw new ObjectModelNotFoundException("Question not found")
    }
    return question
  }

  async getProductQuestions(productId: string): Promise<IQuestion[]> {
    const processedSlug = getIdFromNameId(productId)
    return await Question.find(
      { product: processedSlug },
      {},
      {
        populate: [
          {
            path: "customer",
            select: "name avatar"
          }
        ]
      }
    )
  }

  async getCustomerQuestions(customerId: string): Promise<IQuestion[]> {
    return await Question.find(
      { customer: customerId },
      {},
      {
        populate: [
          {
            path: "product",
            select: "name thumbnail"
          }
        ]
      }
    )
  }

  async update(id: string, data: Partial<IQuestion>): Promise<IQuestion> {
    const question = await Question.findByIdAndUpdate(id, { $set: data }, { new: true })
    if (!question) {
      throw new ObjectModelOperationException("Question not found")
    }
    return question
  }
  async delete(id: string): Promise<DeleteResult> {
    const question = await Question.findById(id)
    if (!question) {
      throw new ObjectModelOperationException("Question not found")
    }
    return await question.deleteOne()
  }

  async replyQuestion(questionId: string, content: string): Promise<IQuestion> {
    const question = await Question.findById(questionId)
    if (!question) {
      throw new ObjectModelNotFoundException("Question not found")
    }
    if (question.answer) {
      question.answer.content = content
    } else {
      const answer: IReply = {
        content,
        likes: []
      }
      question.answer = answer
    }

    await question.save()
    return question
  }

  async likeQuestion(questionId: string, userId: string): Promise<IQuestion> {
    const question = await Question.findById(questionId)
    if (!question) {
      throw new ObjectModelNotFoundException("Question not found")
    }
    if (question.likes.includes(userId)) {
      question.likes = question.likes.filter((id) => id !== userId)
    } else {
      question.likes.push(userId)
    }

    await question.save()
    return question
  }

  async likeAnswer(questionId: string, userId: string): Promise<IQuestion> {
    const question = await Question.findById(questionId)
    if (!question) {
      throw new ObjectModelNotFoundException("Question not found")
    }
    if (!question.answer) {
      throw new ObjectModelOperationException("Question has no answer")
    }

    if (question.answer.likes.includes(userId)) {
      question.answer.likes = question.answer.likes.filter((id) => id !== userId)
    } else {
      question.answer.likes.push(userId)
    }

    await question.save()
    return question
  }
}
