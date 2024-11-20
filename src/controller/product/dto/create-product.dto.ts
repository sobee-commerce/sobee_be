import { IProduct } from "@/interface"

type CreateProductRequest = Omit<IProduct, "deletedAt" | "sold">

type CreateProductResponse = IProduct

export { CreateProductRequest, CreateProductResponse }
