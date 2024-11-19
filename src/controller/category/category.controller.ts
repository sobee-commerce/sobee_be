import { ICategory, IRoute } from "@/interface"
import { CategoryService } from "./category.service"
import { Request, Response, Router } from "express"
import { ErrorResponse, HttpStatusCode, SuccessfulResponse } from "@/common/utils"
import middleware from "@/common/middleware"
import { ERole } from "@/enum"
import { asyncHandler } from "@/common/utils"
import { Category } from "@/models"

export class CategoryController implements IRoute {
  private readonly router: Router
  private readonly path: string

  private readonly PATHS = {
    ROOT: "/",
    CATEGORY: "/:categoryId",
    PRODUCT: "/:categoryId/product",
    WITH_PRODUCT: "/product"
  }

  private static readonly categoryService = new CategoryService()

  constructor(path = "/api/category") {
    this.router = Router()
    this.path = path
    this.initializeRoutes()
  }

  private initializeRoutes(): void {
    this.router.post(
      this.PATHS.ROOT,
      middleware.verifyToken,
      middleware.verifyRoles(ERole.ADMIN, ERole.STAFF),
      middleware.mustHaveFields<ICategory>("name", "slug"),
      asyncHandler(this.createCategory)
    )

    this.router.put(
      this.PATHS.CATEGORY,
      middleware.verifyToken,
      middleware.verifyRoles(ERole.ADMIN, ERole.STAFF),
      asyncHandler(this.updateCategory)
    )

    this.router.delete(
      this.PATHS.CATEGORY,
      middleware.verifyToken,
      middleware.verifyRoles(ERole.ADMIN, ERole.STAFF),
      asyncHandler(this.deleteCategory)
    )

    this.router.get(this.PATHS.ROOT, asyncHandler(this.getAllCategories))

    this.router.get(this.PATHS.WITH_PRODUCT, asyncHandler(this.getCategoryAndProducts))

    this.router.get(this.PATHS.CATEGORY, asyncHandler(this.getCategoryBy))

    this.router.get(this.PATHS.PRODUCT, asyncHandler(this.getProductsByCategory))
  }

  private async createCategory(req: Request, res: Response): Promise<void> {
    const data = await CategoryController.categoryService.create(req.body)
    new SuccessfulResponse(data, HttpStatusCode.CREATED, "Category created successfully").from(res)
  }

  private async updateCategory(req: Request, res: Response): Promise<void> {
    const data = await CategoryController.categoryService.update(req.params.categoryId, req.body)
    new SuccessfulResponse(data, HttpStatusCode.OK, "Category updated successfully").from(res)
  }

  private async deleteCategory(req: Request, res: Response): Promise<void> {
    const data = await CategoryController.categoryService.delete(req.params.categoryId)
    new SuccessfulResponse(data, HttpStatusCode.OK, "Category deleted successfully").from(res)
  }

  private async getAllCategories(req: Request, res: Response): Promise<void> {
    const page = parseInt(req.query.page?.toString() || "1")
    const limit = parseInt(req.query.limit?.toString() || "12")
    const keyword = req.query.keyword?.toString()

    const data = await CategoryController.categoryService.getAll(page, limit, keyword)
    new SuccessfulResponse(data.data, HttpStatusCode.OK).withPagination(res, page, limit, data.total)
  }

  private async getCategoryBy(req: Request, res: Response): Promise<void> {
    const data = await CategoryController.categoryService.getOne("_id", req.params.categoryId)
    new SuccessfulResponse(data, HttpStatusCode.OK).from(res)
  }

  private async getProductsByCategory(req: Request, res: Response): Promise<void> {
    const page = parseInt(req.query.page?.toString() || "1")
    const limit = parseInt(req.query.limit?.toString() || "12")
    const data = await CategoryController.categoryService.getProducts(req.params.categoryId, page, limit)
    new SuccessfulResponse(data.data, HttpStatusCode.OK).withPagination(res, page, limit, data.total)
  }

  private async getCategoryAndProducts(req: Request, res: Response): Promise<void> {
    const page = parseInt(req.query.page?.toString() || "1")
    const limit = parseInt(req.query.limit?.toString() || "12")
    const data = await CategoryController.categoryService.getCategoryAndProducts(page, limit)
    new SuccessfulResponse(data.data, HttpStatusCode.OK).withPagination(res, page, limit, data.total)
  }

  getPath(): string {
    return this.path
  }

  getRouter(): Router {
    return this.router
  }
}
