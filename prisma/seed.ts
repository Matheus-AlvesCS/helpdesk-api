import "dotenv/config"
import { Pool } from "pg"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../src/generated/prisma/client"

const connectionString = `${process.env.DATABASE_URL}`
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  await prisma.user.createMany({
    data: [
      {
        name: "Administrador",
        email: "admin@email.com",
        password: "admin",
        role: "admin",
      },
      {
        name: "João Carlos",
        email: "joao@email.com",
        password: "123456",
        availability: [
          "07:00",
          "08:00",
          "09:00",
          "10:00",
          "11:00",
          "13:00",
          "14:00",
          "15:00",
          "16:00",
        ],
        role: "technician",
      },
      {
        name: "Luiz Pereira",
        email: "luiz@email.com",
        password: "123456",
        availability: [
          "08:00",
          "09:00",
          "10:00",
          "11:00",
          "12:00",
          "15:00",
          "16:00",
          "17:00",
          "18:00",
          "19:00",
        ],
        role: "technician",
      },
      {
        name: "Amanda Soares",
        email: "amanda@email.com",
        password: "123456",
        availability: [
          "08:00",
          "09:00",
          "10:00",
          "11:00",
          "13:00",
          "14:00",
          "15:00",
          "16:00",
          "17:00",
          "18:00",
        ],
        role: "technician",
      },
    ],
  })

  await prisma.service.createMany({
    data: [
      {
        name: "Instalação e atualização de softwares",
        price: 42.85,
      },
      {
        name: "Instalação e atualização de hardwares",
        price: 57.35,
      },
      {
        name: "Diagnóstico e remoção de vírus",
        price: 30,
      },
      {
        name: "Suporte a impressoras",
        price: 50.5,
      },
      {
        name: "Suporte a periféricos",
        price: 28.75,
      },
      {
        name: "Solução de problemas de conectividade de internet",
        price: 20,
      },
      {
        name: "Backup e recuperação de dados",
        price: 15.25,
      },
      {
        name: "Otimização de desempenho do sistema operacional",
        price: 20,
      },
      {
        name: "Configuração de VPN e Acesso Remoto",
        price: 25.4,
      },
    ],
  })
}
main()
  .then(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    await pool.end()
    process.exit(1)
  })
