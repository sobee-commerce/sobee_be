import { ERole } from "@/enum"
import { IMiddleware, IRole, IStaff, IUser } from "@/interface"
import User from "@/models/User"
import { NextFunction, Request, Response } from "express"
import jwt, { JwtPayload } from "jsonwebtoken"
import { ESTAFF_PERMISSIONS, ErrorResponse, HttpStatusCode, verifyToken } from "./utils"
import KeyTokenService from "./utils/keyToken"
import { EActionPermissions, ac } from "./utils/rbac"
import { Model } from "mongoose"
import { RoleService } from "@/controller"
import { Permission } from "accesscontrol"

const HEADER = {
  AUTHORIZATION: "Authorization",
  CLIENTID: "x-client-id",
  REFRESHTOKEN: "x-refresh-token"
}

class Middleware implements IMiddleware {
  async verifyToken(req: Request, res: Response, next: NextFunction) {
    try {
      // console.log(req.header(HEADER.AUTHORIZATION))

      // //check if client id is present in the header
      // const clientId = req.header(HEADER.CLIENTID)

      // if (!clientId) return new ErrorResponse(HttpStatusCode.BAD_REQUEST, "Missing client id").from(res)

      // //check if the client id is present in the database
      // const keyStore = await KeyTokenService.findbyUserId(clientId)
      // if (!keyStore) return new ErrorResponse(HttpStatusCode.UNAUTHORIZED, "Not found keyStore").from(res)

      //check if have refresh token in the header or body
      const refreshToken = req.header(HEADER.REFRESHTOKEN) || req.body.refreshToken
      if (refreshToken) {
        const decoded = verifyToken(refreshToken, process.env.REFRESH_TOKEN_SECRET) as JwtPayload
        // if (clientId !== decoded.userId)
        //   return new ErrorResponse(HttpStatusCode.UNAUTHORIZED, "Invalid request").from(res)

        req.userId = decoded.userId
        req.role = decoded.role
        return next()
      }

      //check if the token is present in the header
      const authHeader = req.header(HEADER.AUTHORIZATION)
      const accessToken = authHeader && authHeader.split(" ")[1]

      if (!accessToken) {
        return new ErrorResponse(HttpStatusCode.UNAUTHORIZED, "Access denied. No token provided").from(res)
      }

      // const decoded = jwt.verify(accessToken, process.env.JWT_SECRET) as JwtPayload
      const decoded = verifyToken(accessToken, process.env.ACCESS_TOKEN_SECRET) as JwtPayload

      //check if the client id in the token is the same as the client id in the header
      // if (clientId !== decoded.userId)
      //   return new ErrorResponse(
      //     HttpStatusCode.UNAUTHORIZED,
      //     "Access denied. Your client id is not match with token"
      //   ).from(res)

      req.userId = decoded.userId
      req.role = decoded.role
      let user: IUser | null = null

      if (decoded.role === ERole.STAFF) {
        user = await User.findById(
          decoded.userId,
          {},
          {
            populate: {
              path: "_user",
              select: "staffRole",
              populate: {
                path: "staffRole",
                select: "role_name"
              }
            }
          }
        ).lean()

        req.staffRole = ((user?._user as IStaff)?.staffRole as IRole)?.role_name
      } else {
        user = await User.findById(decoded.userId).lean()
      }

      if (!user) {
        return new ErrorResponse(HttpStatusCode.UNAUTHORIZED, "User not found").from(res)
      }

      next()
    } catch (err: any) {
      if (err instanceof jwt.TokenExpiredError && req.path !== "/refresh-token") {
        return new ErrorResponse(HttpStatusCode.UNAUTHORIZED, "Token has expired").from(res)
      }

      return new ErrorResponse(HttpStatusCode.UNAUTHORIZED, `Invalid Token: ${err.message}`).from(res)
    }
  }

  verifyRoles(...roles: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
      // console.log(req.role)
      if (!req.role) {
        return new ErrorResponse(HttpStatusCode.FORBIDDEN, "Access denied").from(res)
      }

      if (!roles.includes(req.role)) {
        return new ErrorResponse(HttpStatusCode.FORBIDDEN, "Access denied").from(res)
      }

      next()
    }
  }

  verifyParams(...params: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
      for (const param of params) {
        if (!req.params[param]) {
          return new ErrorResponse(HttpStatusCode.BAD_REQUEST, `Missing param: ${param}`).from(res)
        }
      }

      next()
    }
  }

  verifyQuery(...queries: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
      for (const query of queries) {
        if (!req.query[query]) {
          return new ErrorResponse(HttpStatusCode.BAD_REQUEST, `Missing query: ${query}`).from(res)
        }
      }

      next()
    }
  }

  doNotAllowFields<T = string>(...fields: (keyof T)[]) {
    return (req: Request, res: Response, next: NextFunction) => {
      const body = req.body

      for (const field of fields) {
        if (body[field]) {
          return new ErrorResponse(HttpStatusCode.BAD_REQUEST, `Field ${String(field)} is not allowed`).from(res)
        }
      }

      next()
    }
  }

  mustHaveFields<T>(...fields: (keyof T)[]) {
    return (req: Request, res: Response, next: NextFunction) => {
      const body = req.body
      const leftFields = [] as string[]
      for (const field of fields) {
        if (body[field] === undefined) {
          leftFields.push(field as string)
        }
      }

      if (leftFields.length > 0) {
        return new ErrorResponse(HttpStatusCode.BAD_REQUEST, `Missing fields: ${leftFields.join(", ")}`).from(res)
      }

      next()
    }
  }

  verifyStaffPermissions(...permissions: ESTAFF_PERMISSIONS[]) {
    return async (req: Request, res: Response, next: NextFunction) => {
      // const role = req.role
      // if (!role) {
      //     return new ErrorResponse(HttpStatusCode.FORBIDDEN, "Access denied").from(res)
      // }

      // if (role === ERole.ADMIN) {
      //     return next()
      // }

      // const userId = req.userId

      // const user = await User.findById(
      //     userId,
      //     {},
      //     {
      //         populate: {
      //             path: "user",
      //             select: "staffRole",
      //             populate: {
      //                 path: "staffRole",
      //                 select: "permissions"
      //             }
      //         }
      //     }
      // )
      // if (!user) {
      //     return new ErrorResponse(HttpStatusCode.NOT_FOUND, "User not found").from(res)
      // }

      // const staff = user.user as IStaff
      // const staffRole = staff.staffRole as IRole
      // const staffPermissions = staffRole.permissions

      // for (const permission of permissions) {
      //     if (!staffPermissions.includes(permission)) {
      //         return new ErrorResponse(HttpStatusCode.FORBIDDEN, "Access denied").from(res)
      //     }
      // }

      next()
    }
  }

  /**
   * @description: grand access to the resource
   * @param {action} action: the action that the role can do (e.g: read, readAny, createOwn, createAny,...)
   * @param {resource} resource: the resource that the role can access (e.g: user, product, review,...)
   * @returns
   */
  grandAccess(action: EActionPermissions, resource: string) {
    return async (req: Request, res: Response, next: NextFunction) => {
      //get role from token and check if the role has the permission to access the resource
      const role = req.role
      if (!role) {
        return new ErrorResponse(HttpStatusCode.FORBIDDEN, "Access denied").from(res)
      }
      //query the database to get all the roles and their permissions

      const listRoles = await new RoleService().getAllListRoles()

      //set the roles and their permissions to the access control
      ac.setGrants(listRoles)

      //check if the action is allowed for access control
      if (!ac.can(role)[action]) {
        return new ErrorResponse(HttpStatusCode.FORBIDDEN, "Access denied!").from(res)
      }

      //check if the role has the permission to access the resource
      let permission: Permission

      if (role === ERole.STAFF) {
        if (!req.staffRole) {
          return new ErrorResponse(HttpStatusCode.FORBIDDEN, "Access denied").from(res)
        }
        permission = ac.can(req.staffRole as string)[action](resource)
      } else {
        permission = ac.can(role)[action](resource)
      }

      //if the permission is not granted, return an error
      if (!permission.granted) {
        return new ErrorResponse(HttpStatusCode.FORBIDDEN, "Access denied").from(res)
      }

      //if the role is not a customer, set the permission to granted
      /**
       * explain: the customer can only read their own resource but other roles can read any resource if they have the permission
       * another purpose is first condition to verify owner of the resource in "veryfyOwner" middleware
       */
      if (role !== ERole.CUSTOMER) req.permission = permission.granted

      next()
    }
  }

  /**
   * @description: verify the owner of the resource in the request params with the requester
   * @param {onwerFields} onwerFields: the field that contains the owner id
   * @param {model} model: the model of the resource (e.g: User, Product, Review)
   * @param {idField} idField: the field that contains the id of the resource in the request params
   * @returns
   */
  veryfyOwner<T>(onwerFields: keyof T, model: Model<T>, idField: string = "id") {
    return async (req: Request, res: Response, next: NextFunction) => {
      //if the permission is granted, return next
      /**
       *explain: if the permission is granted, it means the role is not a customer and the role has the permission to access the resource with owner permission
       */
      if (req.permission) return next()

      //get the user id from the token and the id of the resource from the request params
      const userId = req.userId
      const id = req.params[idField]

      if (!userId) {
        return new ErrorResponse(HttpStatusCode.FORBIDDEN, "Access denied").from(res)
      }

      if (!id) {
        return new ErrorResponse(HttpStatusCode.BAD_REQUEST, "Missing id").from(res)
      }

      //query the database to get the resource
      const data = await model.findById(id).lean()

      //if the resource is not found, return an error
      if (!data) {
        return new ErrorResponse(HttpStatusCode.NOT_FOUND, "Data not found").from(res)
      }

      //if the owner of the resource is not the requester, return an error
      if (data[onwerFields]?.toString() !== userId) {
        return new ErrorResponse(HttpStatusCode.FORBIDDEN, "Access denied").from(res)
      }

      next()
    }
  }
}

export default new Middleware()
