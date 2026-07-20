import { Router } from "express"

import { TicketsController } from "../controllers/tickets-controller"
import { TicketsServicesController } from "../controllers/tickets-services-controller"

import { ensureAuthenticated } from "../middlewares/ensure-authenticated"
import { verifyAuthorization } from "../middlewares/verify-authorization"

const ticketsRoutes = Router()
const ticketsController = new TicketsController()
const ticketsServicesController = new TicketsServicesController()

ticketsRoutes.use(ensureAuthenticated)
ticketsRoutes.post(
  "/",
  verifyAuthorization(["client"]),
  ticketsController.create,
)
ticketsRoutes.post(
  "/:id/service",
  verifyAuthorization(["technician"]),
  ticketsServicesController.create,
)
ticketsRoutes.get("/", verifyAuthorization(["admin"]), ticketsController.index)
ticketsRoutes.get(
  "/my-tickets",
  verifyAuthorization(["client", "technician"]),
  ticketsController.myTickets,
)

export { ticketsRoutes }
