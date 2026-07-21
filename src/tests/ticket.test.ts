import request from "supertest"

import { app } from "../app"
import { prisma } from "../database/prisma"

describe("Ticket endpoints", () => {
  let client_id: string
  let admin_id: string
  let technician_id: string
  let ticket_id: string
  let user_token: string
  let admin_token: string

  afterAll(async () => {
    await prisma.user.delete({ where: { id: client_id } })
    await prisma.user.delete({ where: { id: technician_id } })
    await prisma.user.delete({ where: { id: admin_id } })
  })

  it("should create a new client successfully", async () => {
    const userResponse = await request(app).post("/users").send({
      name: "Test User",
      email: "test@example.com",
      password: "testuser",
    })

    client_id = userResponse.body.id

    expect(userResponse.status).toBe(201)
    expect(userResponse.body.email).toBe("test@example.com")
  })

  it("should login with created client successfully", async () => {
    const response = await request(app).post("/sessions").send({
      email: "test@example.com",
      password: "testuser",
    })

    user_token = response.body.token

    expect(response.status).toBe(200)
    expect(response.body.token).toBeDefined()
  })

  it("should create a new technician successfully", async () => {
    const adminResponse = await request(app).post("/users").send({
      name: "Test Admin",
      email: "testadmin@example.com",
      password: "testadmin",
    })

    admin_id = adminResponse.body.id

    await prisma.user.update({
      where: { id: admin_id },
      data: { role: "admin" },
    })

    const response = await request(app).post("/sessions").send({
      email: "testadmin@example.com",
      password: "testadmin",
    })

    admin_token = response.body.token

    expect(response.body.user.role).toBe("admin")

    const userResponse = await request(app)
      .post("/users/create")
      .send({
        name: "Test Technician",
        email: "testtechnician@example.com",
        role: "technician",
        password: "testuser",
      })
      .set("Authorization", `Bearer ${admin_token}`)

    technician_id = userResponse.body.id

    expect(userResponse.status).toBe(201)
    expect(userResponse.body.role).toBe("technician")
  })

  it("should create a ticket successfully", async () => {
    const sessionResponse = await request(app).post("/sessions").send({
      email: "test@example.com",
      password: "testuser",
    })

    user_token = sessionResponse.body.token

    const response = await request(app)
      .post("/tickets")
      .send({
        title: "Test ticket",
        clientId: client_id,
        technicianId: technician_id,
        serviceId: "29b0f6ac-d7ca-44fa-b8b6-d796df1b301b",
      })
      .set("Authorization", `Bearer ${user_token}`)

    ticket_id = response.body.id

    expect(response.status).toBe(201)
    expect(response.body.id).toBeDefined()
  })
})
