import * as z from "zod"

const envSchema = z.object({
  DB_USERNAME: z.string().nonempty(),
  DB_PASSWORD: z.string().nonempty(),
  DB_NAME: z.string().nonempty(),
  DATABASE_URL: z.url().nonempty(),
  JWT_SECRET: z.string().nonempty(),
  PORT: z.coerce.number().default(3333),
})

export const env = envSchema.parse(process.env)
