import { Server } from "socket.io"
import server from "./http-server"

const io = new Server(server, {
  maxHttpBufferSize: 1e8,
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["client", "token"]
  }
})

export default io
