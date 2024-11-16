import {
  ChangePasswordRequest,
  ChangePasswordResponse,
  LoginRequest,
  LoginResponse,
  MeRequest,
  MeResponse,
  RegisterRequest,
  RegisterResponse
} from "./dto"

export abstract class AuthRepository {
  abstract register(data: RegisterRequest): Promise<RegisterResponse>
  abstract login(data: LoginRequest): Promise<LoginResponse>
  abstract me(data: MeRequest): Promise<MeResponse>
  abstract changePassword(data: ChangePasswordRequest): Promise<ChangePasswordResponse>
}
