import express from "express"

import { routes } from "./routes"

import { errorHandler } from "./middlewares/error-handler"

import uploadConfig from "./configs/upload-config"

const app = express()
app.use(express.json())

app.use("/uploads", express.static(uploadConfig.UPLOADS_FOLDER))
app.use(routes)

app.use(errorHandler)

export { app }
