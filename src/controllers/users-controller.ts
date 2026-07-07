import { Request, Response } from "express"

export class UsersController {
  async create(request: Request, response: Response) {
    return response.json({ message: "ok" })
  }
}
