import { IQuestion } from "@/interface"
import { DeleteResult } from "mongodb"

export abstract class QuestionRepository {
  abstract create(data: IQuestion): Promise<IQuestion>
  abstract getAll(): Promise<Array<IQuestion>>
  abstract getOne<T = string>(key: string, value: T): Promise<IQuestion>
  abstract update(id: string, data: Partial<IQuestion>): Promise<IQuestion>
  abstract delete(id: string): Promise<DeleteResult>
}
