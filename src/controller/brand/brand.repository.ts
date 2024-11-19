import { IBrand } from "@/interface"

export abstract class BrandRepository {
  abstract create(req: IBrand): Promise<IBrand>
}
