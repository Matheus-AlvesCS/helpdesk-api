import { Request, Response } from "express"
import * as z from "zod"

import { prisma } from "../database/prisma"
import { AppError } from "../utils/app-error"

export class TicketsServicesController {
  async create(request: Request, response: Response) {
    const bodySchema = z.object({
      serviceId: z.uuid(),
    })

    const paramsSchema = z.object({
      id: z.uuid(),
    })

    const { serviceId } = bodySchema.parse(request.body)

    const { id } = paramsSchema.parse(request.params)

    const existingTicket = await prisma.ticket.findUnique({
      where: { id },
    })

    if (!existingTicket) {
      throw new AppError("Esse ticket não existe", 404)
    }

    if (existingTicket.status === "closed") {
      throw new AppError(
        "O ticket já foi resolvido, não é possível adicionar mais serviços",
      )
    }

    const existingService = await prisma.service.findUnique({
      where: {
        id: serviceId,
      },
    })

    if (existingService && existingService.active === true) {
      const existingTicketService = await prisma.ticketService.findMany({
        where: {
          ticketId: id,
        },
      })

      existingTicketService.forEach((ticketService) => {
        if (existingService.id === ticketService?.serviceId) {
          throw new AppError(
            `Esse serviço (${existingService.name}) já está atribuído a esse ticket`,
          )
        }
      })
    } else {
      throw new AppError("O serviço escolhido é inválido.")
    }

    if (existingTicket.technicianId !== request.user.user_id) {
      throw new AppError("Sem permissão", 401)
    }

    const newTicketService = await prisma.ticketService.create({
      data: {
        ticketId: id,
        serviceId: existingService.id,
        price: Number(existingService.price),
      },
    })

    return response.status(201).json(newTicketService)
  }

  async delete(request: Request, response: Response) {
    const bodySchema = z.object({
      serviceId: z.uuid(),
    })

    const paramsSchema = z.object({
      id: z.uuid(),
    })

    const { serviceId } = bodySchema.parse(request.body)

    const { id } = paramsSchema.parse(request.params)

    const existingTicket = await prisma.ticket.findUnique({
      where: { id },
    })

    if (!existingTicket) {
      throw new AppError("Esse ticket não existe", 404)
    }

    if (existingTicket.status === "closed") {
      throw new AppError(
        "O ticket já foi resolvido, não é possível remover serviços",
      )
    }

    const existingService = await prisma.service.findUnique({
      where: {
        id: serviceId,
      },
    })

    if (!existingService) {
      throw new AppError("Esse serviço não existe", 404)
    }

    if (existingTicket.technicianId !== request.user.user_id) {
      throw new AppError("Sem permissão", 401)
    }

    await prisma.ticketService.delete({
      where: {
        ticketId_serviceId: {
          ticketId: id,
          serviceId,
        },
      },
    })

    return response.status(200).json()
  }
}
