import { Router } from "express"

export interface IRoute {
  getRouter(): Router
  getPath(): string
}
