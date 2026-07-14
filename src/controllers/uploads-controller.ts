import { Request, Response } from "express"

import * as z from "zod"

import { DiskStorage } from "../providers/disk-storage"

import uploadConfig from "../configs/upload-config"

const diskStorage = new DiskStorage()

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
      const filename = await diskStorage.saveFile(file.filename)

      return response.json({ filename })
    } catch (error) {
      if (error instanceof z.ZodError) {
        if (request.file) {
          await diskStorage.deleteFile(request.file.filename, "tmp")
        }
      }

      throw error
    }
  }
}
