import { Request, Response, NextFunction } from "express"

import { AppError } from "../utils/app-error"

export function verifyAuthorization(authorizatedRoles: string[]) {
  return (request: Request, response: Response, next: NextFunction) => {
    if (!request.user) {
      throw new AppError("Usuário não autenticado", 401)
    } else if (!authorizatedRoles.includes(request.user.role)) {
      throw new AppError("Não autorizado", 401)
    }

    return next()
  }
}
