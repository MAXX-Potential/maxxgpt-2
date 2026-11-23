/**
 * @jest-environment node
 */
jest.mock("@/lib/server/server-chat-helpers", () => ({
  getServerProfile: jest.fn(),
  checkApiKey: jest.fn()
}))
jest.mock("@/lib/envs", () => ({ isUsingEnvironmentKey: jest.fn(() => true) }))

import { POST as keysPost } from "@/app/api/retrieval/keys/route"
import { getServerProfile } from "@/lib/server/server-chat-helpers"
import { isUsingEnvironmentKey } from "@/lib/envs"

const mockProfile = getServerProfile as jest.Mock
const req = (body: string) =>
  new Request("http://localhost/api/retrieval/keys", { method: "POST", body })

afterEach(() => jest.clearAllMocks())

describe("POST /api/retrieval/keys", () => {
  it("returns 401 with no session and does not inspect env keys", async () => {
    mockProfile.mockRejectedValue(new Error("User not found"))
    const res = await keysPost(req(JSON.stringify({ key: "OPENAI_API_KEY" })))
    expect(res.status).toBe(401)
    expect(isUsingEnvironmentKey).not.toHaveBeenCalled()
  })

  it("returns 400 for an invalid key type with a session", async () => {
    mockProfile.mockResolvedValue({ user_id: "u1" })
    const res = await keysPost(req(JSON.stringify({ key: "NOPE" })))
    expect(res.status).toBe(400)
  })

  it("returns 400 for an invalid JSON body with a session", async () => {
    mockProfile.mockResolvedValue({ user_id: "u1" })
    expect((await keysPost(req("{nope"))).status).toBe(400)
  })

  it("returns 200 { isUsing } with a session", async () => {
    mockProfile.mockResolvedValue({ user_id: "u1" })
    const res = await keysPost(req(JSON.stringify({ key: "OPENAI_API_KEY" })))
    expect(res.status).toBe(200)
    expect((await res.json()).isUsing).toBe(true)
  })
})
