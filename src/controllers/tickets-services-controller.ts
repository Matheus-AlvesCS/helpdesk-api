import { Request, Response } from "express"
import * as z from "zod"

import { prisma } from "../database/prisma"
import { AppError } from "../utils/app-error"

export class TicketsServicesController {
  async create(request: Request, response: Response) {
    const bodySchema = z.object({
      serviceIds: z.uuid().array(),
    })

    const paramsSchema = z.object({
      id: z.uuid(),
    })

    const { serviceIds } = bodySchema.parse(request.body)

    const { id } = paramsSchema.parse(request.params)

    const existingTicket = await prisma.ticket.findUnique({
      where: { id },
    })

    const existingServices = await prisma.service.findMany({
      where: {
        OR: serviceIds.map((service) => {
          return { id: service }
        }),
      },
    })

    if (existingServices) {
      const existingTicketService = await prisma.ticketService.findMany({
        where: {
          ticketId: id,
        },
      })

      existingServices.forEach((service) => {
        existingTicketService.forEach((ticketService) => {
          if (service.id === ticketService?.serviceId) {
            throw new AppError(
              `Esse serviço (${service.name}) já está atribuído a esse ticket`,
            )
          }
        })
      })
    }

    if (existingServices.length < serviceIds.length) {
      throw new AppError("Um dos serviços escolhidos é inválido")
    }

    if (!existingTicket) {
      throw new AppError("Esse ticket não existe", 404)
    }

    if (existingTicket.technicianId !== request.user.user_id) {
      throw new AppError("Sem permissão", 401)
    }

    const newServices = await prisma.$transaction(async (tx) => {
      const services = existingServices.map(async (service) => {
        return await tx.ticketService.create({
          data: {
            ticketId: id,
            serviceId: service.id,
            price: Number(service.price),
          },
        })
      })

      return Promise.all(services)
    })

    return response.status(201).json(newServices)
  }
}
