import { Request, Response } from "express"
import * as z from "zod"
import { hash } from "bcrypt"

import { AppError } from "../utils/app-error"
import { prisma } from "../database/prisma"

export class UsersController {
  async create(request: Request, response: Response) {
    const bodySchema = z.object({
      name: z.string().trim().min(3),
      email: z.email().trim(),
      password: z.string().trim().min(6),
      role: z.enum(["admin", "technician", "client"]).default("client"),
    })

    const { email, name, password, role } = bodySchema.parse(request.body)

    const existingUser = await prisma.user.findFirst({
      where: {
        email,
      },
    })

    if (existingUser) {
      throw new AppError("Já existe um usuário cadastrado com esse e-mail.")
    }

    const passwordHash = await hash(password, 8)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: passwordHash,
        role,
      },
    })

    return response.status(201).json(user)
  }
}
