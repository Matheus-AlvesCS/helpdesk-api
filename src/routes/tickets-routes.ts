import { Router } from "express"

import { TicketsController } from "../controllers/tickets-controller"

import { ensureAuthenticated } from "../middlewares/ensure-authenticated"
import { verifyAuthorization } from "../middlewares/verify-authorization"

const ticketsRoutes = Router()
const ticketsController = new TicketsController()

ticketsRoutes.use(ensureAuthenticated)
ticketsRoutes.post(
  "/",
  verifyAuthorization(["client"]),
  ticketsController.create,
)

export { ticketsRoutes }
