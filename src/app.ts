import express from "express"
import cors from "cors"

import { routes } from "./routes"

import { errorHandler } from "./middlewares/error-handler"

import uploadConfig from "./configs/upload-config"

const app = express()

app.use(express.json())
app.use(cors())

app.use("/uploads", express.static(uploadConfig.UPLOADS_FOLDER))
app.use(routes)

app.use(errorHandler)

export { app }
