import middleware from "@/common/middleware"
import { HttpStatusCode, SuccessfulResponse, asyncHandler } from "@/common/utils"
import { EProductStatus, ERole } from "@/enum"
import { IProduct, IRoute } from "@/interface"
import { Request, Response, Router } from "express"
import { ProductService } from "./product.service"
import { Product } from "@/models"

export class ProductController implements IRoute {
  private readonly router: Router
  private readonly path: string

  private readonly PATHS = {
    ROOT: "/",
    PRODUCT: "/:productId",
    PUBLISHED: "/published",
    DRAFT: "/draft",
    POPULAR: "/popular",
    DISCOUNTED: "/discount",
    FEATURED: "/featured",
    BEST_SELLER: "/best-seller",
    RELATED: "/:productId/related",
    COLOR: "/color",
    CUSTOMER_FAVORITE: "/customer/favorite",
    TOGGLE_FAVORITE: "/:productId/favorite",
    BY_ORDER: "/by-order",
    RECOMMEND: "/:id/recommend"
  }

  private static readonly productService = new ProductService()

  constructor(path = "/api/product") {
    this.router = Router()
    this.path = path
    this.initializeRoutes()
  }

  private initializeRoutes(): void {
    this.router.post(
      this.PATHS.ROOT,
      middleware.verifyToken,
      middleware.verifyRoles(ERole.ADMIN, ERole.STAFF),
      middleware.mustHaveFields<IProduct>(
        "category",
        "name",
        "displayPrice",
        "quantity",
        "description",
        "type",
        "thumbnail",
        "tax",
        "shippingFee"
      ),
      asyncHandler(this.createProduct)
    )
    this.router.put(
      this.PATHS.PRODUCT,
      middleware.verifyParams("productId"),
      middleware.verifyToken,
      middleware.verifyRoles(ERole.ADMIN, ERole.STAFF),
      asyncHandler(this.updateProduct)
    )
    this.router.delete(
      this.PATHS.PRODUCT,
      middleware.verifyParams("productId"),
      middleware.verifyToken,
      middleware.verifyRoles(ERole.ADMIN, ERole.STAFF),
      asyncHandler(this.deleteProduct)
    )

    this.router.get(this.PATHS.BY_ORDER, asyncHandler(this.getByOrder))

    this.router.put(
      this.PATHS.TOGGLE_FAVORITE,
      middleware.verifyParams("productId"),
      middleware.verifyToken,
      asyncHandler(this.toggleFavorite)
    )

    this.router.get(this.PATHS.ROOT, asyncHandler(this.getAllProducts))

    this.router.get(
      this.PATHS.PUBLISHED,
      middleware.verifyToken,
      middleware.verifyRoles(ERole.ADMIN, ERole.STAFF),
      asyncHandler(this.getPublishedProducts)
    )

    this.router.get(
      this.PATHS.DRAFT,
      middleware.verifyToken,
      middleware.verifyRoles(ERole.ADMIN, ERole.STAFF),
      asyncHandler(this.getDraftProducts)
    )

    this.router.get(this.PATHS.RECOMMEND, asyncHandler(this.getRecommendProducts))

    this.router.get(this.PATHS.POPULAR, asyncHandler(this.getPopularProducts))

    this.router.get(this.PATHS.DISCOUNTED, asyncHandler(this.getDiscountedProducts))

    this.router.get(this.PATHS.FEATURED, asyncHandler(this.getFeaturedProducts))

    this.router.get(this.PATHS.BEST_SELLER, asyncHandler(this.getBestSellerProducts))

    this.router.get(this.PATHS.RELATED, asyncHandler(this.getRelatedProducts))

    this.router.get(this.PATHS.COLOR, asyncHandler(this.getProductsColor))

    this.router.get(this.PATHS.CUSTOMER_FAVORITE, middleware.verifyToken, asyncHandler(this.getCustomerFavorite))

    this.router.get(this.PATHS.PRODUCT, asyncHandler(this.getProductById))
  }
  private async getByOrder(req: Request, res: Response) {
    const response = await ProductController.productService.getProductsAndCustomerInOrder()
    new SuccessfulResponse(response, HttpStatusCode.OK, "Get product successfully").from(res)
  }
  private async createProduct(req: Request, res: Response) {
    const response = await ProductController.productService.create(req.body)
    new SuccessfulResponse(response, HttpStatusCode.CREATED, "Create product successfully").from(res)
  }

  private async updateProduct(req: Request, res: Response) {
    const { productId } = req.params
    const response = await ProductController.productService.update(productId, req.body)
    new SuccessfulResponse(response, HttpStatusCode.OK, "Update product successfully").from(res)
  }

  private async deleteProduct(req: Request, res: Response) {
    const { productId } = req.params
    const response = await ProductController.productService.delete(productId)
    new SuccessfulResponse(response, HttpStatusCode.OK, "Delete product successfully").from(res)
  }

  private async getPublishedProducts(req: Request, res: Response) {
    const page = parseInt(req.query.page?.toString() || "1")
    const limit = parseInt(req.query.limit?.toString() || "12")
    const response = await ProductController.productService.getPublishedProducts(req.query, page, limit)
    new SuccessfulResponse(response.data, HttpStatusCode.OK, "Get products successfully").withPagination(
      res,
      page,
      limit,
      response.total
    )
  }

  private async getDraftProducts(req: Request, res: Response) {
    const page = parseInt(req.query.page?.toString() || "1")
    const limit = parseInt(req.query.limit?.toString() || "12")
    const response = await ProductController.productService.getDraftProducts(req.query, page, limit)
    new SuccessfulResponse(response.data, HttpStatusCode.OK, "Get draft products successfully").withPagination(
      res,
      page,
      limit,
      response.total
    )
  }

  private async getPopularProducts(req: Request, res: Response) {
    const response = await ProductController.productService.getPopular()
    new SuccessfulResponse(response, HttpStatusCode.OK, "Get popular products successfully").from(res)
  }

  private async getDiscountedProducts(req: Request, res: Response) {
    const response = await ProductController.productService.getDiscounted()
    new SuccessfulResponse(response, HttpStatusCode.OK, "Get discounted products successfully").from(res)
  }

  private async getBestSellerProducts(req: Request, res: Response) {
    const response = await ProductController.productService.getBestSeller()
    new SuccessfulResponse(response, HttpStatusCode.OK, "Get best seller products successfully").from(res)
  }

  private async getFeaturedProducts(req: Request, res: Response) {
    const response = await ProductController.productService.getFeatured()
    new SuccessfulResponse(response, HttpStatusCode.OK, "Get featured products successfully").from(res)
  }

  private async getRelatedProducts(req: Request, res: Response) {
    const response = await ProductController.productService.getRelated(req.params.productId)
    new SuccessfulResponse(response, HttpStatusCode.OK, "Get related products successfully").from(res)
  }

  private async getProductById(req: Request, res: Response) {
    const { productId } = req.params
    const response = await ProductController.productService.getBySlug(productId)
    new SuccessfulResponse(response, HttpStatusCode.OK, "Get product successfully").from(res)
  }

  private async getProductsColor(req: Request, res: Response) {
    const { color } = req.params
    const response = await ProductController.productService.getColors()
    new SuccessfulResponse(response, HttpStatusCode.OK, "Get product successfully").from(res)
  }

  private async getCustomerFavorite(req: Request, res: Response) {
    const response = await ProductController.productService.getUserFavorites(req.userId)
    new SuccessfulResponse(response, HttpStatusCode.OK, "Get product successfully").from(res)
  }

  private async toggleFavorite(req: Request, res: Response) {
    const { productId } = req.params
    const response = await ProductController.productService.toggleFavorite(productId, req.userId)
    new SuccessfulResponse(response, HttpStatusCode.OK, "Toggle favorite successfully").from(res)
  }

  private async getAllProducts(req: Request, res: Response) {
    const page = parseInt(req.query.page?.toString() || "1")
    const limit = parseInt(req.query.limit?.toString() || "12")
    const response = await ProductController.productService.getAll(req.query, page, limit, {
      isDraft: false
    })

    new SuccessfulResponse(response.data, HttpStatusCode.OK, "Get all products successfully").withPagination(
      res,
      page,
      limit,
      response.total
    )
  }

  private async getRecommendProducts(req: Request, res: Response) {
    const response = await ProductController.productService.getRecommended(req.params.id as string)
    new SuccessfulResponse(response, HttpStatusCode.OK, "Get recommend products successfully").from(res)
  }

  getPath(): string {
    return this.path
  }

  getRouter(): Router {
    return this.router
  }
}
