import express from "express"
import {createServer} from "http"
import path from "path"
import {fileURLToPath} from "url"
import {Server} from "socket.io"
import {YSocketIO} from "y-socket.io/dist/server"


const __direname = path.dirname(fileURLToPath(import.meta.url))



const app = express()

const httpServer = createServer(app)

// app.use(express.static("public"))


const io = new Server(httpServer,{
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
})


const ySocketIO = new YSocketIO(io)
ySocketIO.initialize()




app.get("/health", (req, res) =>{
    res.status(200).json({
        message: "Ok",
        success: true
    })
})


app.use(express.static(path.join(__direname, "public")))

const PORT = process.env.PORT || 3000


httpServer.listen(PORT, () => {
    console.log("Server is running on port 30000")
})