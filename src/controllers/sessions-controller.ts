import { Request, Response } from "express"
import * as z from "zod"
import jwt from "jsonwebtoken"
import { compare } from "bcrypt"

import { AppError } from "../utils/app-error"
import { prisma } from "../database/prisma"
import { authConfig } from "../configs/auth-config"

export class SessionsController {
  async create(request: Request, response: Response) {
    const bodySchema = z.object({
      email: z.email().trim(),
      password: z.string().trim().min(6),
    })

    const { email, password } = bodySchema.parse(request.body)

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    })

    if (!existingUser) {
      throw new AppError("E-mail ou senha incorretos.")
    }

    const passwordMatch = await compare(password, existingUser.password)

    if (!passwordMatch) {
      throw new AppError("E-mail ou senha incorretos.")
    }

    const { secret, expiresIn } = authConfig.jwt

    const token = jwt.sign({ role: existingUser.role }, secret, {
      subject: existingUser.id,
      expiresIn,
    })

    const { password: _, ...userWithoutPassword } = existingUser

    return response.status(200).json({ token, user: userWithoutPassword })
  }
}
