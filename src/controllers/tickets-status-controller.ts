import { Request, Response } from "express"
import * as z from "zod"

import { prisma } from "../database/prisma"

import { AppError } from "../utils/app-error"

export class TicketsStatusController {
  async startTicket(request: Request, response: Response) {
    const paramsSchema = z.object({
      id: z.uuid(),
    })

    const { id } = paramsSchema.parse(request.params)

    const existingTicket = await prisma.ticket.findUnique({ where: { id } })

    if (!existingTicket) {
      throw new AppError("Esse ticket não existe")
    }

    if (
      existingTicket.technicianId !== request.user.user_id &&
      request.user.role !== "admin"
    ) {
      throw new AppError("Sem permissão", 401)
    }

    if (existingTicket.status === "in_progress") {
      throw new AppError("Esse ticket já está em atendimento")
    }

    if (existingTicket.status === "closed") {
      throw new AppError("Esse ticket já está resolvido")
    }

    await prisma.ticket.update({
      where: {
        id,
      },
      data: {
        status: "in_progress",
      },
    })

    return response.status(200).json()
  }

  async closeTicket(request: Request, response: Response) {
    const paramsSchema = z.object({
      id: z.uuid(),
    })

    const { id } = paramsSchema.parse(request.params)

    const existingTicket = await prisma.ticket.findUnique({ where: { id } })

    if (!existingTicket) {
      throw new AppError("Esse ticket não existe")
    }

    if (
      existingTicket.technicianId !== request.user.user_id &&
      request.user.role !== "admin"
    ) {
      throw new AppError("Sem permissão", 401)
    }

    if (existingTicket.status === "closed") {
      throw new AppError("Esse ticket já está resolvido")
    }

    await prisma.ticket.update({
      where: {
        id,
      },
      data: {
        status: "closed",
      },
    })

    return response.status(200).json()
  }
}
