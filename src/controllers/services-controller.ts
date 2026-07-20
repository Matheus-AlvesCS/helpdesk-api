import { Request, Response } from "express"
import * as z from "zod"

import { prisma } from "../database/prisma"
import { AppError } from "../utils/app-error"

export class ServicesController {
  async create(request: Request, response: Response) {
    const bodySchema = z.object({
      name: z.string().trim().min(5),
      price: z.number().positive(),
      active: z.boolean().default(true),
    })

    const { name, active, price } = bodySchema.parse(request.body)

    const existingService = await prisma.service.findFirst({ where: { name } })

    if (existingService) {
      throw new AppError("Já existe um serviço com esse nome cadastrado")
    }

    const service = await prisma.service.create({
      data: {
        name,
        price,
        active,
      },
    })

    return response.status(201).json(service)
  }

  async update(request: Request, response: Response) {
    const bodySchema = z.object({
      name: z.string().trim().min(5),
      price: z.number().positive(),
    })

    const paramsSchema = z.object({
      id: z.uuid(),
    })

    const { name, price } = bodySchema.parse(request.body)

    const { id } = paramsSchema.parse(request.params)

    const existingService = await prisma.service.findUnique({ where: { id } })

    if (!existingService) {
      throw new AppError("Esse serviço não existe")
    }

    await prisma.service.update({
      where: {
        id,
      },
      data: {
        name,
        price,
      },
    })

    return response.status(200).json()
  }

  async index(request: Request, response: Response) {
    const querySchema = z.object({
      name: z.string().trim().optional(),
      active: z
        .string()
        .transform((value) => (value === "true" ? true : false))
        .optional(),
    })

    const { name, active } = querySchema.parse(request.query)

    const allServices = await prisma.service.findMany({
      where: {
        name: {
          contains: name,
          mode: "insensitive",
        },
        active: request.user.role !== "admin" ? true : active,
      },
    })

    return response.status(200).json(allServices)
  }

  async deactivate(request: Request, response: Response) {
    const paramsSchema = z.object({
      id: z.uuid(),
    })

    const { id } = paramsSchema.parse(request.params)

    const existingService = await prisma.service.findUnique({
      where: {
        id,
      },
    })

    if (!existingService) {
      throw new AppError("Serviço não encontrado", 404)
    }

    if (existingService.active === false) {
      throw new AppError("Esse serviço já está desativado")
    }

    await prisma.service.update({
      where: {
        id,
      },
      data: {
        active: false,
      },
    })

    return response.status(200).json()
  }

  async activate(request: Request, response: Response) {
    const paramsSchema = z.object({
      id: z.uuid(),
    })

    const { id } = paramsSchema.parse(request.params)

    const existingService = await prisma.service.findUnique({
      where: {
        id,
      },
    })

    if (!existingService) {
      throw new AppError("Serviço não encontrado", 404)
    }

    if (existingService.active === true) {
      throw new AppError("Esse serviço já está ativado")
    }

    await prisma.service.update({
      where: {
        id,
      },
      data: {
        active: true,
      },
    })

    return response.status(200).json()
  }
}
