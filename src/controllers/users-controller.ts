import { Request, Response } from "express"
import * as z from "zod"
import { hash } from "bcrypt"

import { AppError } from "../utils/app-error"
import { prisma } from "../database/prisma"

export class UsersController {
  async createClient(request: Request, response: Response) {
    const bodySchema = z.object({
      name: z.string().trim().min(3),
      email: z.email().trim(),
      password: z.string().trim().min(6),
    })

    const { email, name, password } = bodySchema.parse(request.body)

    const existingUser = await prisma.user.findUnique({
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
      },
    })

    return response.status(201).json(user)
  }

  async createUser(request: Request, response: Response) {
    const bodySchema = z.object({
      name: z.string().trim().min(3),
      email: z.email().trim(),
      password: z.string().trim().min(6),
      role: z.enum(["client", "technician", "admin"]),
      availability: z.string().array().default([]),
    })

    const { name, email, password, role, availability } = bodySchema.parse(
      request.body,
    )

    const existingUser = await prisma.user.findUnique({ where: { email } })

    if (request.user.role !== "admin") {
      throw new AppError("Sem permissão")
    }

    if (existingUser) {
      throw new AppError("Já existe um usuário cadastrado com esse e-mail.")
    }

    if (role === "technician") {
      availability.push(
        "08:00",
        "09:00",
        "10:00",
        "11:00",
        "14:00",
        "15:00",
        "16:00",
        "17:00",
        "18:00",
      )
    }

    const passwordHash = await hash(password, 8)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: passwordHash,
        role,
        availability,
      },
    })

    return response.status(201).json(user)
  }

  async update(request: Request, response: Response) {
    const bodySchema = z.object({
      name: z.string().trim().min(3).optional(),
      email: z.email().trim().optional(),
      password: z.string().trim().min(6).optional(),
      availability: z.string().array().optional(),
      profileImage: z.string().trim().min(15).optional(),
    })

    const paramsSchema = z.object({
      id: z.uuid(),
    })

    const { name, email, password, availability, profileImage } =
      bodySchema.parse(request.body)

    const { id } = paramsSchema.parse(request.params)

    const existingUser = await prisma.user.findFirst({
      where: {
        id,
      },
    })

    const existingEmail = await prisma.user.findUnique({ where: { email } })

    if (!existingUser) {
      throw new AppError("Usuário não encontrado", 404)
    }

    if (existingEmail) {
      throw new AppError("Esse e-mail já está em uso")
    }

    const newPassword = password && (await hash(password, 8))

    if (request.user.user_id !== id && request.user.role !== "admin") {
      throw new AppError("Sem permissão", 401)
    }

    await prisma.user.update({
      where: {
        id,
      },
      data: {
        name,
        email,
        password: newPassword,
        availability,
        profileImage,
      },
    })

    return response.status(200).json()
  }

  async index(request: Request, response: Response) {
    const querySchema = z.object({
      role: z.enum(["technician", "client"]).optional(),
      name: z.string().trim().optional(),
    })

    const { name, role } = querySchema.parse(request.query)

    const allUsers = await prisma.user.findMany({
      where: {
        name: {
          contains: name,
          mode: "insensitive",
        },
        role,
      },
    })

    return response.status(200).json(allUsers)
  }

  async delete(request: Request, response: Response) {
    const paramsSchema = z.object({
      id: z.uuid(),
    })

    const { id } = paramsSchema.parse(request.params)

    const existingUser = await prisma.user.findFirst({ where: { id } })

    if (!existingUser) {
      throw new AppError("Usuário não encontrado", 404)
    }

    if (request.user.user_id !== id && request.user.role !== "admin") {
      throw new AppError("Sem permissão")
    }

    await prisma.user.delete({ where: { id } })

    return response.status(200).json()
  }
}
