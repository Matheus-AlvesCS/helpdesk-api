import { Request, Response } from "express"
import * as z from "zod"

import { prisma } from "../database/prisma"

import { AppError } from "../utils/app-error"
import { patternFilters } from "../utils/ticket-index-filter"
import { formatTicket } from "../utils/ticket-total-price"
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

    const filters = {
      where: {
        title: {
          contains: title,
        },
        status,
      },
      ...patternFilters,
    }

    const allTickets = await prisma.ticket.findMany(filters)

    const tickets = allTickets.map(formatTicket)

    return response.status(200).json(tickets)
  }

  async myTickets(request: Request, response: Response) {
    const filters = {
      where: {},
      ...patternFilters,
    }

    if (request.user.role === "client") {
      filters.where = {
        clientId: request.user.user_id,
      }
    }

    if (request.user.role === "technician") {
      filters.where = {
        technicianId: request.user.user_id,
      }
    }

    const myTickets = await prisma.ticket.findMany(filters)

    const tickets = myTickets.map((ticket) => {
      return {
        ...ticket,
        totalPrice: ticket.services
          .reduce((acc, current) => Number(current.price) + acc, 0)
          .toFixed(2),
      }
    })

    return response.status(200).json(tickets)
  }

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
