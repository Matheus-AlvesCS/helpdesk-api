import { Router } from "express"

import { TicketsController } from "../controllers/tickets-controller"
import { TicketsServicesController } from "../controllers/tickets-services-controller"
import { TicketsStatusController } from "../controllers/tickets-status-controller"

import { ensureAuthenticated } from "../middlewares/ensure-authenticated"
import { verifyAuthorization } from "../middlewares/verify-authorization"

const ticketsRoutes = Router()
const ticketsController = new TicketsController()
const ticketsServicesController = new TicketsServicesController()
const ticketsStatusController = new TicketsStatusController()

ticketsRoutes.use(ensureAuthenticated)
ticketsRoutes.post(
  "/",
  verifyAuthorization(["client"]),
  ticketsController.create,
)
ticketsRoutes.get("/", verifyAuthorization(["admin"]), ticketsController.index)
ticketsRoutes.get(
  "/my-tickets",
  verifyAuthorization(["client", "technician"]),
  ticketsController.myTickets,
)
ticketsRoutes.get(
  "/:id",
  verifyAuthorization(["admin", "technician", "client"]),
  ticketsController.show,
)
ticketsRoutes.post(
  "/:id/service",
  verifyAuthorization(["technician"]),
  ticketsServicesController.create,
)
ticketsRoutes.patch(
  "/:id/start",
  verifyAuthorization(["admin", "technician"]),
  ticketsStatusController.startTicket,
)
ticketsRoutes.patch(
  "/:id/close",
  verifyAuthorization(["admin", "technician"]),
  ticketsStatusController.closeTicket,
)

export { ticketsRoutes }
