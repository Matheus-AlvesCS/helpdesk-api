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
}
