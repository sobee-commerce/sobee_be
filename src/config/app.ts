import express, { Request, Response } from "express"
import cors from "cors"
import morgan from "morgan"
import swaggerUi from "swagger-ui-express"
import swaggerJsdoc from "swagger-jsdoc"

const specs = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Documentation",
      version: "1.0.0",
      description: "API Documentation",
      license: {
        name: "MIT",
        url: "https://spdx.org/licenses/MIT.html"
      },
      contact: {
        name: "Sobee Support",
        email: "sobee@gmail.com"
      }
    },
    servers: [
      {
        url: "http://localhost:8000",
        description: "Development server"
      }
    ],
    basePath: "/",
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter JWT Bearer token"
        }
      }
    }
  },
  apis: ["./src/controller/**/*.ts"]
})

const app = express()
const allowOrigins = "*"
app.use(
  cors({
    origin: "*",
    exposedHeaders: "content-length",
    credentials: true,
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Origin",
      "X-Requested-With",
      "Accept",
      "Accept-Encoding",
      "Accept-Language",
      "Host",
      "Referer",
      "User-Agent",
      "X-CSRF-Token",
      "x-client-id",
      "x-refresh-token",
      "Access-Control-Allow-Origin",
      "Access-Control-Allow-Credentials",
      "client",
      "token"
    ],
    maxAge: 86400,
    preflightContinue: false,
    optionsSuccessStatus: 204
  })
)

app.use(morgan("common"))
app.use(express.urlencoded({ extended: true, limit: "50mb" }))

app.use(express.json({ limit: "50mb" }))
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs, { explorer: true }))

export default app
