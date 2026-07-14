import { Request, Response } from "express"

export class UploadsController {
  async create(request: Request, response: Response) {
    return response.json(request.file)
  }
}
