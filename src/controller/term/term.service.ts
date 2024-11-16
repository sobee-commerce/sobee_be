import { ITerm } from "@/interface"
import { TermRepository } from "./term.repository"
import { Term } from "@/models"
import { ObjectModelNotFoundException } from "@/common/exceptions"

export class TermService implements TermRepository {
  async create(req: ITerm): Promise<ITerm> {
    const newTerm = new Term(req)
    return await newTerm.save()
  }
  async update(id: string, req: Partial<ITerm>): Promise<ITerm> {
    const updated = await Term.findByIdAndUpdate(id, { $set: req }, { new: true }).lean()
    if (!updated) throw new ObjectModelNotFoundException("Term not found")
    return updated
  }
  async delete(id: string): Promise<Object> {
    const foundTerm = await Term.findById(id)
    if (!foundTerm) throw new ObjectModelNotFoundException("Term not found")
    return await foundTerm.deleteOne()
  }
  async getAll(): Promise<ITerm[]> {
    return await Term.find().populate("issued_by").lean()
  }

  async getById(id: string): Promise<ITerm> {
    const term = await Term.findById(id).populate("issued_by").lean()
    if (!term) throw new ObjectModelNotFoundException("Term not found")
    return term
  }
}
