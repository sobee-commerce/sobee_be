import { NextFunction, Request, Response } from "express"

// eslint-disable-next-line @typescript-eslint/ban-types
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((err) => next(err))
  }
}

export const errorHandlerMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || 500

  const respone = {
    success: false,
    statusCode: statusCode,
    message: err.message || "Internal server error"
  }

  const isProduction = process.env.NODE_ENV === "production" || process.env.NODE_ENV === "prod"
  // console.log(process.env.NODE_ENV)

  if (!isProduction) {
    respone["stack"] = err.stack
  }

  return res.status(statusCode).json(respone)
}
