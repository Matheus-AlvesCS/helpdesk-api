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
      serviceId: z.uuid(),
    })

    const { title, status, technicianId, serviceId } = bodySchema.parse(
      request.body,
    )

    const existingTechnician = await prisma.user.findFirst({
      where: {
        id: technicianId,
        role: "technician",
      },
    })

    const existingService = await prisma.service.findUnique({
      where: {
        id: serviceId,
      },
    })

    if (!existingService) {
      throw new AppError("Serviço inválido")
    }

    if (!existingTechnician) {
      throw new AppError("Esse técnico não existe")
    }

    if (!request.user) {
      throw new AppError("Usuário não autenticado", 401)
    }

    const ticket = await prisma.$transaction(async (tx) => {
      const ticket = await tx.ticket.create({
        data: {
          title,
          status,
          clientId: request.user.user_id,
          technicianId,
        },
      })

      const service = await tx.ticketService.create({
        data: {
          ticketId: ticket.id,
          serviceId: serviceId,
          price: existingService.price,
        },
      })

      return { ...ticket, serviceId: service.serviceId, price: service.price }
    })

    return response.status(201).json(ticket)
  }

  async index(request: Request, response: Response) {
    const querySchema = z.object({
      title: z.string().trim().optional(),
      status: z.enum(["open", "in_progress", "closed"]).optional(),
    })

    const { status, title } = querySchema.parse(request.query)

    const allTickets = await prisma.ticket.findMany({
      where: {
        title: {
          contains: title,
          mode: "insensitive",
        },
        status,
      },
      omit: {
        clientId: true,
        technicianId: true,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        technician: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        services: {
          select: {
            service: {
              select: {
                id: true,
                name: true,
              },
            },
            price: true,
          },
        },
      },
    })

    const tickets = allTickets.map((ticket) => {
      return {
        ...ticket,
        totalPrice: ticket.services
          .reduce((acc, current) => Number(current.price) + acc, 0)
          .toFixed(2),
      }
    })

    return response.status(200).json(tickets)
  }
}
