import { Request, Response } from "express"

import * as z from "zod"

import uploadConfig from "../configs/upload-config"

export class UploadsController {
  async create(request: Request, response: Response) {
    try {
      const fileSchema = z
        .object({
          mimetype: z
            .string()
            .refine(
              (type) => uploadConfig.ACCEPTED_IMAGE_TYPES.includes(type),
              `Formato de imagem inválido, formatos aceitos: ${uploadConfig.ACCEPTED_IMAGE_TYPES}`,
            ),
          filename: z.string().nonempty(),
          size: z
            .number()
            .refine(
              (size) => size <= uploadConfig.MAX_FILE_SIZE,
              `O arquivo excedeu o tamanho máximo de ${uploadConfig.MAX_SIZE_MB}MB`,
            ),
        })
        .loose()

      const file = fileSchema.parse(request.file)

      return response.json(file)
    } catch (error) {
      if (error instanceof z.ZodError) {
        if (request.file) {
          console.log(request.file)
        }
      }

      throw error
    }
  }
}
