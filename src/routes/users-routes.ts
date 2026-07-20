import { Router } from "express"

import { UsersController } from "../controllers/users-controller"

import { ensureAuthenticated } from "../middlewares/ensure-authenticated"
import { verifyAuthorization } from "../middlewares/verify-authorization"

const usersRoutes = Router()
const usersController = new UsersController()

usersRoutes.post("/", usersController.createClient)
usersRoutes.use(ensureAuthenticated)
usersRoutes.post(
  "/create",
  verifyAuthorization(["admin"]),
  usersController.createUser,
)
usersRoutes.put(
  "/:id",
  verifyAuthorization(["admin", "technician", "client"]),
  usersController.update,
)
usersRoutes.get("/", verifyAuthorization(["admin"]), usersController.index)
usersRoutes.delete(
  "/:id",
  verifyAuthorization(["admin", "client"]),
  usersController.delete,
)

export { usersRoutes }
