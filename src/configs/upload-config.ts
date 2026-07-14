import multer from "multer"

import { fileURLToPath } from "node:url"
import path from "node:path"

import crypto from "node:crypto"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const TMP_FOLDER = path.resolve(__dirname, "..", "..", "tmp")
const UPLOADS_FOLDER = path.resolve(TMP_FOLDER, "uploads")

const MAX_SIZE_MB = 3
const MAX_FILE_SIZE = 1024 * 1024 * 3

const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/jpg"]

const MULTER = {
  storage: multer.diskStorage({
    destination: TMP_FOLDER,
    filename: function (req, file, cb) {
      const fileHash = crypto.randomBytes(10).toString("hex")
      const filename = `${fileHash}-${file.originalname}`

      return cb(null, filename)
    },
  }),
}

export default {
  TMP_FOLDER,
  UPLOADS_FOLDER,
  MAX_SIZE_MB,
  MAX_FILE_SIZE,
  ACCEPTED_IMAGE_TYPES,
  MULTER,
}
