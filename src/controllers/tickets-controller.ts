import { Request, Response } from "express"
import * as z from "zod"

import { prisma } from "../database/prisma"
import { AppError } from "../utils/app-error"

export class TicketsController {
  async create(request: Request, response: Response) {
    const bodySchema = z.object({
      title: z.string().trim().min(5),
      status: z.enum(["open", "in_progress", "closed"]).default("open"),
      technicianId: z.uuid(),
    })

    const { title, status, technicianId } = bodySchema.parse(request.body)

    const existingTicket = await prisma.ticket.findFirst({
      where: {
        title,
      },
    })

    const existingTechnician = await prisma.user.findUnique({
      where: {
        id: technicianId,
        role: "technician",
      },
    })

    if (!existingTechnician) {
      throw new AppError("Esse técnico não existe")
    }

    if (!request.user) {
      throw new AppError("Usuário não autenticado", 401)
    }

    if (existingTicket?.clientId === request.user.user_id) {
      throw new AppError("Você já criou um serviço com esse nome")
    }

    const ticket = await prisma.ticket.create({
      data: {
        title,
        status,
        clientId: request.user.user_id,
        technicianId,
      },
    })

    return response.status(201).json(ticket)
  }
}
