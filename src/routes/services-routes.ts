import { Router } from "express"

import { ServicesController } from "../controllers/services-controller"

import { ensureAuthenticated } from "../middlewares/ensure-authenticated"
import { verifyAuthorization } from "../middlewares/verify-authorization"

const servicesRoutes = Router()
const servicesController = new ServicesController()

servicesRoutes.use(ensureAuthenticated)
servicesRoutes.post(
  "/",
  verifyAuthorization(["admin"]),
  servicesController.create,
)
servicesRoutes.get(
  "/",
  verifyAuthorization(["admin", "technician", "client"]),
  servicesController.index,
)
servicesRoutes.put(
  "/:id",
  verifyAuthorization(["admin"]),
  servicesController.update,
)
servicesRoutes.patch(
  "/:id/deactivate",
  verifyAuthorization(["admin"]),
  servicesController.deactivate,
)
servicesRoutes.patch(
  "/:id/activate",
  verifyAuthorization(["admin"]),
  servicesController.activate,
)

export { servicesRoutes }
