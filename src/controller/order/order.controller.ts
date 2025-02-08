import { IOrder, IRoute } from "@/interface"
import { OrderService } from "./order.service"
import { Request, Response, Router } from "express"
import { HttpStatusCode, SuccessfulResponse, asyncHandler } from "@/common/utils"
import middleware from "@/common/middleware"
import { EOrderStatus, ERole } from "@/enum"

export class OrderController implements IRoute {
  private readonly router: Router
  private readonly path: string

  private readonly PATHS = {
    ORDER_ITEM: "/item",
    ORDER_ITEM_ID: "/item/:id",
    ORDER_ITEM_QUANTITY: "/item/:id/quantity",
    ORDER: "/",
    ORDER_ID: "/:id",
    CUSTOMER: "/customer",
    STATUS: "/:id/status",
    CANCEL: "/:id/status/cancel",
    MOCK: "/mock",
    REORDER: "/:id/reorder",
    PAYMENT_SHEET: "/payment-sheet"
  }

  private static readonly orderService = new OrderService()

  constructor(path = "/api/order") {
    this.router = Router()
    this.path = path
    this.router.use(middleware.verifyToken)
    this.initializeRoutes()
  }

  private initializeRoutes(): void {
    this.router.post(this.PATHS.ORDER_ITEM, middleware.mustHaveFields("product"), asyncHandler(this.addOrderItem))
    this.router.delete(this.PATHS.ORDER_ITEM_ID, asyncHandler(this.removeOrderItem))
    this.router.put(
      this.PATHS.ORDER_ITEM_QUANTITY,
      middleware.mustHaveFields("quantity"),
      asyncHandler(this.updateOrderItemQuantity)
    )
    this.router.post(this.PATHS.MOCK, middleware.verifyRoles(ERole.ADMIN), asyncHandler(this.createOrderMockData))
    this.router.post(this.PATHS.ORDER, middleware.mustHaveFields<IOrder>("orderItems"), asyncHandler(this.createOrder))
    this.router.get(this.PATHS.ORDER_ITEM, asyncHandler(this.getOrderItemsByCustomer))
    this.router.get(this.PATHS.CUSTOMER, asyncHandler(this.getOrdersByCustomer))
    this.router.get("/", middleware.verifyRoles(ERole.ADMIN, ERole.STAFF), asyncHandler(this.getAllOrders))
    this.router.get(
      this.PATHS.PAYMENT_SHEET,
      middleware.verifyQuery("amount"),
      middleware.verifyToken,
      asyncHandler(this.getPaymentSheet)
    )
    this.router.get(this.PATHS.ORDER_ID, asyncHandler(this.getOrderById))
    this.router.put(
      this.PATHS.STATUS,
      middleware.verifyRoles(ERole.ADMIN, ERole.STAFF),
      middleware.mustHaveFields("status"),
      asyncHandler(this.updateOrderStatus)
    )
    this.router.delete(this.PATHS.CANCEL, middleware.verifyToken, asyncHandler(this.cancelOrder))
    this.router.put(this.PATHS.REORDER, middleware.verifyToken, asyncHandler(this.reOrder))
  }

  private async addOrderItem(req: Request, res: Response): Promise<void> {
    const orderItem = await OrderController.orderService.addOrderItem({
      ...req.body,
      customer: req.userId
    })
    new SuccessfulResponse(orderItem, HttpStatusCode.CREATED, "Order item added successfully").from(res)
  }

  private async removeOrderItem(req: Request, res: Response): Promise<void> {
    const data = await OrderController.orderService.removeOrderItem(req.params.id)
    new SuccessfulResponse(data, HttpStatusCode.OK, "Order item removed successfully").from(res)
  }

  private async updateOrderItemQuantity(req: Request, res: Response): Promise<void> {
    const orderItem = await OrderController.orderService.updateOrderItemQuantity(req.params.id, req.body.quantity)
    new SuccessfulResponse(orderItem, HttpStatusCode.OK, "Order item quantity updated successfully").from(res)
  }

  private async createOrder(req: Request, res: Response): Promise<void> {
    const order = await OrderController.orderService.createOrder({
      ...req.body,
      customer: req.userId
    })
    new SuccessfulResponse(order, HttpStatusCode.CREATED, "Order created successfully").from(res)
  }
  private async createOrderMockData(req: Request, res: Response): Promise<void> {
    const order = await OrderController.orderService.createOrderMockData({
      ...req.body,
      customer: req.body.customer || req.userId
    })
    new SuccessfulResponse(order, HttpStatusCode.CREATED, "Order created successfully").from(res)
  }

  private async getOrderItemsByCustomer(req: Request, res: Response): Promise<void> {
    const orderItems = await OrderController.orderService.getOrderItemsByCustomer(req.userId)
    new SuccessfulResponse(orderItems, HttpStatusCode.OK).from(res)
  }

  private async getOrdersByCustomer(req: Request, res: Response): Promise<void> {
    const page = parseInt(req.query.page?.toString() || "1")
    const limit = parseInt(req.query.limit?.toString() || "10")
    const status = req.query.status?.toString()
    const orders = await OrderController.orderService.getOrdersByCustomer(req.userId, page, limit, status)
    new SuccessfulResponse(orders.data, HttpStatusCode.OK).withPagination(res, page, limit, orders.total)
  }

  private async getOrderById(req: Request, res: Response): Promise<void> {
    const orderItems = await OrderController.orderService.getOrderById(req.params.id)
    new SuccessfulResponse(orderItems, HttpStatusCode.OK).from(res)
  }

  private async getAllOrders(req: Request, res: Response): Promise<void> {
    const page = parseInt(req.query.page?.toString() || "1")
    const limit = parseInt(req.query.limit?.toString() || "12")
    const keyword = req.query.keyword?.toString()
    const data = await OrderController.orderService.getAllOrders(page, limit, keyword)
    new SuccessfulResponse(data.data, HttpStatusCode.OK).withPagination(res, page, limit, data.total)
  }

  private async updateOrderStatus(req: Request, res: Response): Promise<void> {
    const order = await OrderController.orderService.updateOrderStatus(req.params.id, req.body.status)
    new SuccessfulResponse(order, HttpStatusCode.OK, "Order status updated successfully").from(res)
  }

  private async cancelOrder(req: Request, res: Response): Promise<void> {
    const order = await OrderController.orderService.updateOrderStatus(req.params.id, EOrderStatus.CANCELED)
    new SuccessfulResponse(order, HttpStatusCode.OK, "Order canceled successfully").from(res)
  }

  private async reOrder(req: Request, res: Response): Promise<void> {
    const order = await OrderController.orderService.updateOrderStatus(req.params.id, EOrderStatus.PENDING)
    new SuccessfulResponse(order, HttpStatusCode.CREATED, "Order re-created successfully").from(res)
  }

  private async getPaymentSheet(req: Request, res: Response): Promise<void> {
    const amount = parseFloat(req.query.amount?.toString() || "0")
    const order = await OrderController.orderService.getPaymentSheet(amount)
    new SuccessfulResponse(order, HttpStatusCode.OK).from(res)
  }

  getPath(): string {
    return this.path
  }

  getRouter(): Router {
    return this.router
  }
}
