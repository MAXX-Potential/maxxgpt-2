/**
 * @jest-environment node
 */
jest.mock("@/lib/server/server-chat-helpers", () => ({
  getServerProfile: jest.fn(),
  checkApiKey: jest.fn()
}))
jest.mock("@/lib/rate-limiter", () => ({
  chatRateLimiter: { check: jest.fn() }
}))
const mockCreate = jest.fn()
const mockList = jest.fn()
jest.mock("openai", () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    chat: { completions: { create: mockCreate } },
    beta: { assistants: { list: mockList } }
  }))
}))

import { POST as commandPost } from "@/app/api/command/route"
import { GET as assistantsGet } from "@/app/api/assistants/openai/route"
import { getServerProfile } from "@/lib/server/server-chat-helpers"
import { chatRateLimiter } from "@/lib/rate-limiter"

const mockProfile = getServerProfile as jest.Mock
const mockCheck = chatRateLimiter.check as jest.Mock

const cmdReq = (body: string) =>
  new Request("http://localhost/api/command", { method: "POST", body })

beforeEach(() => {
  mockProfile.mockResolvedValue({ user_id: "u1", openai_api_key: "k" })
  mockCheck.mockReturnValue({ allowed: true, remaining: 99 })
  mockCreate.mockResolvedValue({ choices: [{ message: { content: "hi" } }] })
  mockList.mockResolvedValue({ data: [{ id: "asst_1" }] })
})
afterEach(() => jest.clearAllMocks())

describe("POST /api/command", () => {
  it("401 (not 500) with no session; no OpenAI call, limiter untouched", async () => {
    mockProfile.mockRejectedValue(new Error("User not found"))
    const res = await commandPost(cmdReq(JSON.stringify({ input: "x" })))
    expect(res.status).toBe(401)
    expect(mockCreate).not.toHaveBeenCalled()
    expect(mockCheck).not.toHaveBeenCalled()
  })

  it("429 when the limiter denies; no OpenAI call", async () => {
    mockCheck.mockReturnValue({ allowed: false, remaining: 0 })
    const res = await commandPost(cmdReq(JSON.stringify({ input: "x" })))
    expect(res.status).toBe(429)
    expect(mockCheck).toHaveBeenCalledWith("u1")
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it("400 for an invalid JSON body", async () => {
    const res = await commandPost(cmdReq("{nope"))
    expect(res.status).toBe(400)
  })

  it("200 with a session under the limit", async () => {
    const res = await commandPost(cmdReq(JSON.stringify({ input: "x" })))
    expect(res.status).toBe(200)
    expect((await res.json()).content).toBe("hi")
  })
})

describe("GET /api/assistants/openai", () => {
  it("401 (not 500) with no session; no OpenAI call", async () => {
    mockProfile.mockRejectedValue(new Error("User not found"))
    const res = await assistantsGet()
    expect(res.status).toBe(401)
    expect(mockList).not.toHaveBeenCalled()
    expect(mockCheck).not.toHaveBeenCalled()
  })

  it("429 when the limiter denies; no OpenAI call", async () => {
    mockCheck.mockReturnValue({ allowed: false, remaining: 0 })
    const res = await assistantsGet()
    expect(res.status).toBe(429)
    expect(mockList).not.toHaveBeenCalled()
  })

  it("200 with a session under the limit", async () => {
    const res = await assistantsGet()
    expect(res.status).toBe(200)
    expect((await res.json()).assistants).toHaveLength(1)
  })
})
