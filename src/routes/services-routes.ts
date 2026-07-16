import { Router } from "express"

import { ServicesController } from "../controllers/services-controller"

import { ensureAuthenticated } from "../middlewares/ensure-authenticated"
import { verifyAuthorization } from "../middlewares/verify-authorization"

const servicesRoutes = Router()
const servicesController = new ServicesController()

servicesRoutes.use(ensureAuthenticated, verifyAuthorization(["admin"]))
servicesRoutes.post("/", servicesController.create)
servicesRoutes.put("/:id", servicesController.update)
servicesRoutes.get("/", servicesController.index)
servicesRoutes.patch("/:id/deactivate", servicesController.deactivate)
servicesRoutes.patch("/:id/activate", servicesController.activate)

export { servicesRoutes }
