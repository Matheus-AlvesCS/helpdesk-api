import request from "supertest"

import { app } from "../app"
import { prisma } from "../database/prisma"

describe("User endpoints", () => {
  let user_id: string
  let user_token: string

  afterAll(async () => {
    await prisma.user.delete({ where: { id: user_id } })
  })

  it("should create a new client successfully", async () => {
    const userResponse = await request(app).post("/users").send({
      name: "Test User",
      email: "test@example.com",
      password: "testuser",
    })

    user_id = userResponse.body.id

    expect(userResponse.status).toBe(201)
    expect(userResponse.body.email).toBe("test@example.com")
  })

  it("should login with created user successfully", async () => {
    const response = await request(app).post("/sessions").send({
      email: "test@example.com",
      password: "testuser",
    })

    user_token = response.body.token

    expect(response.status).toBe(200)
    expect(response.body.token).toBeDefined()
  })

  it("should update user successfully", async () => {
    const response = await request(app)
      .put(`/users/${user_id}`)
      .send({
        profileImage: "testprofileimage.jpeg",
      })
      .set("Authorization", `Bearer ${user_token}`)

    expect(response.status).toBe(200)
    expect(response.body.profileImage).toBeDefined()
  })
})
