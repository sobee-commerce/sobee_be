import { asyncHandler, errorHandlerMiddleware } from "@/common/utils"
import {
  AddressController,
  AuthController,
  BrandController,
  CardController,
  CategoryController,
  ChatMessageController,
  ChatRoomController,
  CouponController,
  CustomerController,
  DayOffController,
  FaqController,
  NotificationController,
  OrderController,
  OrderItemController,
  PaymentAccountController,
  PermissionController,
  ProductController,
  ReviewController,
  RoleController,
  ShippingController,
  StaffController,
  TaxController,
  TermController,
  UploadController,
  UserController,
  AssetController,
  QuestionController,
  FavoriteController
} from "@/controller"
import { AnalyticsController } from "@/controller/analytics"
import { Express } from "express"

function getRoutes(app: Express) {
  const controllers = [
    new AddressController(),
    new AuthController(),
    new CategoryController(),
    new ChatMessageController(),
    new ChatRoomController(),
    new CouponController(),
    new CustomerController(),
    new NotificationController(),
    new OrderController(),
    new OrderItemController(),
    new PermissionController(),
    new ProductController(),
    new ReviewController(),
    new RoleController(),
    new StaffController(),
    new UserController(),
    new TaxController(),
    new DayOffController(),
    new BrandController(),
    new ShippingController(),
    new FaqController(),
    new TermController(),
    new UploadController(),
    new CardController(),
    new PaymentAccountController(),
    new AssetController(),
    new QuestionController(),
    new FavoriteController(),
    new AnalyticsController()
  ]

  controllers.forEach((controller) => {
    app.use(controller.getPath(), asyncHandler(controller.getRouter()))
  })
  app.use(errorHandlerMiddleware)
}

export default getRoutes
