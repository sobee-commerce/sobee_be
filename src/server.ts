import { configDotenv } from "dotenv"
import "module-alias/register"
import { connectDB } from "./common/utils/db"
import app from "./config/app"
import httpServer from "./config/http-server"
import getRoutes from "./routes"
import io from "./config/socket-server"
import getSocketRoutes from "./routes/socket"
import { ErrorResponse, HttpStatusCode, redisClient, verifyToken } from "./common/utils"
import { JwtPayload } from "jsonwebtoken"
import { IKeyToken, IRole, IStaff, IUser } from "./interface"
import KeyToken from "./models/KeyToken"
import { SOCKET_SERVER_MESSAGE } from "./common/constants/socket"
import { User } from "./models"
import { ERole } from "./enum"
import userSocketList from "./routes/socket/chat/userSocketList"

configDotenv()

async function runHttpServer() {
  const HTTP_PORT = process.env.PORT || 3000
  httpServer.listen(HTTP_PORT, () => {
    console.log(`Server is running on port ${HTTP_PORT}`)
  })
}

async function runSocketServer() {
  io.use(async (socket, next) => {
    const accessToken = (socket.handshake.headers.token as string) ?? ""
    // const clientId = (socket.handshake.headers.client as string) ?? ""

    // if (!accessToken || !clientId) return next(new Error("Authentication error!"))

    // const keyToken = await KeyToken.findOne({ user: clientId }).lean()

    // if (!keyToken) return next(new Error("Authentication error!"))

    const decoded = verifyToken(accessToken, process.env.ACCESS_TOKEN_SECRET) as JwtPayload

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
    } else {
      user = await User.findById(decoded.userId).lean()
    }

    if (!user) {
      return next(new ErrorResponse(HttpStatusCode.UNAUTHORIZED, "User not found"))
    }

    socket.data.userId = decoded.userId
    socket.data.role = decoded.role
    // socket.data.keyToken = keyToken as IKeyToken
    socket.data.staffRole = ((user?._user as IStaff)?.staffRole as IRole)?.role_name

    next()
  })
  return new Promise((resolve, reject) => {
    io.on(SOCKET_SERVER_MESSAGE.CONNECTION, async (socket) => {
      // console.log("Socket connected: ", socket.id)
      getSocketRoutes(socket)
      userSocketList.addSocket(socket.data.userId, socket.id)
    })
    resolve("Socket server is running")
  })
}

async function start() {
  await connectDB()
  const message = await runSocketServer()
  console.log(message)
  await runHttpServer()
  getRoutes(app)
  // await redisClient.connect().catch((err) => console.log(err))
}

start()
