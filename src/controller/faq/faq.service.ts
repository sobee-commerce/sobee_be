import { IFaq } from "@/interface"
import { FaqRepository } from "./faq.repository"
import { Faq } from "@/models"
import { ObjectModelNotFoundException } from "@/common/exceptions"

export class FaqService implements FaqRepository {
  async create(req: IFaq): Promise<IFaq> {
    const newFaq = new Faq(req)
    return await newFaq.save()
  }
  async update(id: string, req: Partial<IFaq>): Promise<IFaq> {
    const updated = await Faq.findByIdAndUpdate(id, { $set: req }, { new: true }).lean()
    if (!updated) throw new ObjectModelNotFoundException("FAQ not found")
    return updated
  }
  async delete(id: string): Promise<any> {
    const foundFaq = await Faq.findById(id)
    if (!foundFaq) throw new ObjectModelNotFoundException("FAQ not found")
    return await foundFaq.deleteOne()
  }
  async getAll(): Promise<IFaq[]> {
    return await Faq.find().populate("issued_by").lean()
  }

  async getById(id: string): Promise<IFaq> {
    const faq = await Faq.findById(id).populate("issued_by").lean()
    if (!faq) throw new ObjectModelNotFoundException("FAQ not found")
    return faq
  }
}
