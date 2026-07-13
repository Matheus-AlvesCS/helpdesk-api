import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"

import { authConfig } from "../configs/auth-config"
import { AppError } from "../utils/app-error"

interface ITokenPayload {
  subject: string
  role: string
}

export function ensureAuthenticated(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const authHeader = request.headers.authorization

    if (!authHeader) {
      throw new AppError("Token JWT não encontrado", 401)
    }

    const [, token] = authHeader.split(" ")

    const { secret } = authConfig.jwt

    const { role, subject: user_id } = jwt.verify(
      token,
      secret,
    ) as ITokenPayload

    request.user = {
      user_id,
      role,
    }

    return next()
  } catch (error) {
    throw new AppError("Token inválido", 401)
  }
}
