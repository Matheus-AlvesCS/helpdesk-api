import { Router } from "express"

import { UsersController } from "../controllers/users-controller"

import { ensureAuthenticated } from "../middlewares/ensure-authenticated"
import { verifyAuthorization } from "../middlewares/verify-authorization"

const usersRoutes = Router()
const usersController = new UsersController()

usersRoutes.post("/", usersController.create)
usersRoutes.use(
  ensureAuthenticated,
  verifyAuthorization(["admin", "technician", "client"]),
)
usersRoutes.put("/:id", usersController.update)

export { usersRoutes }
