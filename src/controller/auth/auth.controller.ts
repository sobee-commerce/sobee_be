import { UserAlreadyExistsException, UserNotFoundException, WrongPasswordException } from "@/common/exceptions"
import middleware from "@/common/middleware"
import { ErrorResponse, SuccessfulResponse } from "@/common/utils"
import { IRoute } from "@/interface"
import { Request, Response, Router } from "express"
import { AuthService } from "./auth.service"
import { LoginRequest, RegisterRequest } from "./dto"
import { HttpStatusCode } from "@/common/utils"
import { RefreshTokenRequest } from "./dto/refreshToken.dto"
import { asyncHandler } from "@/common/utils"

export class AuthController implements IRoute {
  private router: Router
  private path: string
  private readonly PATHS = {
    REGISTER: "/register",
    LOGIN: "/login",
    REFRESH_TOKEN: "/refresh-token",
    LOG_OUT: "/logout",
    ME: "/me",
    CHANGE_PASSWORD: "/change-password",
    FORGOT_PASSWORD: "/forgot-password/mail",
    VALIDATE_FORGOT_PASSWORD: "/forgot-password/validate"
  }

  private static readonly authService = new AuthService()

  constructor(path = "/api/auth") {
    this.router = Router()
    this.path = path
    this.initializeRoutes()
  }

  private initializeRoutes(): void {
    this.router.post(
      this.PATHS.REGISTER,
      middleware.mustHaveFields<RegisterRequest>("email", "name", "password"),
      asyncHandler(this.register)
    )

    this.router.post(
      this.PATHS.LOGIN,
      middleware.mustHaveFields<LoginRequest>("emailOrPhone", "password"),
      asyncHandler(this.login)
    )
    this.router.get(this.PATHS.ME, middleware.verifyToken, asyncHandler(this.me))
    this.router.post(
      this.PATHS.REFRESH_TOKEN,
      middleware.mustHaveFields<RefreshTokenRequest>("refreshToken"),
      middleware.verifyToken,
      asyncHandler(this.handleRefreshToken)
    )
    this.router.post(this.PATHS.LOG_OUT, middleware.verifyToken, asyncHandler(this.logout))
    this.router.put(
      this.PATHS.CHANGE_PASSWORD,
      middleware.verifyToken,
      middleware.mustHaveFields("oldPassword", "newPassword"),
      asyncHandler(this.changePassword)
    )

    this.router.post(
      this.PATHS.FORGOT_PASSWORD,
      middleware.mustHaveFields("emailOrPhone"),
      asyncHandler(this.sendForgotPasswordMail)
    )

    this.router.post(
      this.PATHS.VALIDATE_FORGOT_PASSWORD,
      middleware.mustHaveFields("email", "code"),
      asyncHandler(this.validateForgotPassword)
    )
  }

  private async register(req: Request, res: Response) {
    const response = await AuthController.authService.register(req.body)
    new SuccessfulResponse(response, HttpStatusCode.CREATED, "Register successfully").from(res)
  }

  private async login(req: Request, res: Response) {
    const response = await AuthController.authService.login(req.body)
    new SuccessfulResponse(response, HttpStatusCode.OK, "Login successfully").from(res)
  }

  private async me(req: Request, res: Response) {
    const response = await AuthController.authService.me({ userId: req.userId })
    new SuccessfulResponse(response, HttpStatusCode.OK, "Get me successfully").from(res)
  }

  private async handleRefreshToken(req: Request, res: Response) {
    const response = await AuthController.authService.handleRefreshToken(
      { userId: req.userId, role: req.role },
      req.body.refreshToken,
      req.keyToken
    )
    new SuccessfulResponse(response, HttpStatusCode.OK, "Refresh token successfully").from(res)
  }

  private async logout(req: Request, res: Response) {
    const response = await AuthController.authService.logout(req.userId)
    new SuccessfulResponse(response, HttpStatusCode.OK, "Logout successfully").from(res)
  }

  private async changePassword(req: Request, res: Response) {
    const response = await AuthController.authService.changePassword({
      ...req.body,
      userId: req.userId
    })
    new SuccessfulResponse(response, HttpStatusCode.OK, "Change password successfully").from(res)
  }

  private async sendForgotPasswordMail(req: Request, res: Response) {
    const response = await AuthController.authService.sendForgotPasswordMail(req.body.emailOrPhone)
    new SuccessfulResponse(response, HttpStatusCode.OK, "Send forgot password mail successfully").from(res)
  }

  private async validateForgotPassword(req: Request, res: Response) {
    const response = await AuthController.authService.validateForgotPassword(req.body.email, req.body.code)
    new SuccessfulResponse(response, HttpStatusCode.OK, "Validate forgot password successfully").from(res)
  }

  getPath(): string {
    return this.path
  }

  getRouter(): Router {
    return this.router
  }
}
