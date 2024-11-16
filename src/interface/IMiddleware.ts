import { ESTAFF_PERMISSIONS } from "@/common/utils"
import { NextFunction, Request, Response } from "express"

export interface IMiddleware {
  verifyToken: (req: Request, res: Response, next: NextFunction) => void
  doNotAllowFields: <T>(...fields: Array<keyof T>) => (req: Request, res: Response, next: NextFunction) => void
  mustHaveFields: <T>(...fields: Array<keyof T>) => (req: Request, res: Response, next: NextFunction) => void
  verifyRoles: (...roles: string[]) => (req: Request, res: Response, next: NextFunction) => void
  verifyStaffPermissions: (
    ...permissions: Array<ESTAFF_PERMISSIONS>
  ) => (req: Request, res: Response, next: NextFunction) => void
}
