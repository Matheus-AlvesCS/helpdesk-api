import { Request, Response, NextFunction } from "express"

import { ZodError } from "zod"
import { AppError } from "../utils/app-error"

export function errorHandler(
  error: any,
  request: Request,
  response: Response,
  _: NextFunction,
) {
  if (error instanceof AppError) {
    return response
      .status(error.statusCode)
      .json({ message: error.errorMessage })
  } else if (error instanceof ZodError) {
    return response
      .status(400)
      .json({ message: "Erro de validação", issues: error.issues })
  }

  return response
    .status(500)
    .json({ message: error.message ?? "Ocorreu um erro interno no servidor" })
}
