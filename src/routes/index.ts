import { Router } from "express"

import { usersRoutes } from "./users-routes"
import { sessionsRoutes } from "./sessions-routes"
import { uploadsRoutes } from "./uploads-routes"
import { servicesRoutes } from "./services-routes"

const routes = Router()

routes.use("/users", usersRoutes)
routes.use("/sessions", sessionsRoutes)
routes.use("/uploads", uploadsRoutes)
routes.use("/services", servicesRoutes)

export { routes }
