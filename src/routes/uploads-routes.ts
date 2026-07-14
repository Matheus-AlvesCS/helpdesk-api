import { Router } from "express"
import multer from "multer"

import { UploadsController } from "../controllers/uploads-controller"

import { ensureAuthenticated } from "../middlewares/ensure-authenticated"
import { verifyAuthorization } from "../middlewares/verify-authorization"

import uploadConfig from "../configs/upload-config"

const uploadsRoutes = Router()
const uploadsController = new UploadsController()

const upload = multer(uploadConfig.MULTER)

uploadsRoutes.use(
  ensureAuthenticated,
  verifyAuthorization(["admin", "technician", "client"]),
)
uploadsRoutes.post("/", upload.single("avatar"), uploadsController.create)

export { uploadsRoutes }
