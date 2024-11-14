import http from "http"
import app from "./app"

const httpServer = http.createServer(app)

export default httpServer
