/**
 * @jest-environment node
 */
import { makeSupabaseMock } from "@/test-utils/supabase-mock"

jest.mock("@/lib/server/server-chat-helpers", () => ({
  getServerProfile: jest.fn(),
  checkApiKey: jest.fn()
}))
jest.mock("@supabase/supabase-js", () => ({ createClient: jest.fn() }))

import { POST as getPost } from "@/app/api/username/get/route"
import { POST as availablePost } from "@/app/api/username/available/route"
import { getServerProfile } from "@/lib/server/server-chat-helpers"
import { createClient } from "@supabase/supabase-js"

const mockProfile = getServerProfile as jest.Mock
const mockCreateClient = createClient as jest.Mock

const req = (path: string, body: unknown) =>
  new Request(`http://localhost${path}`, { method: "POST", body: JSON.stringify(body) })

beforeEach(() => {
  const db = makeSupabaseMock({
    profiles: [{ user_id: "u1", username: "alice" }]
  })
  mockCreateClient.mockReturnValue(db.client)
})
afterEach(() => jest.clearAllMocks())

describe("username routes require a session", () => {
  it("get: 401 without a session and no DB client created", async () => {
    mockProfile.mockRejectedValue(new Error("User not found"))
    const res = await getPost(req("/api/username/get", { userId: "u1" }))
    expect(res.status).toBe(401)
    expect(mockCreateClient).not.toHaveBeenCalled()
  })

  it("available: 401 without a session and no DB client created", async () => {
    mockProfile.mockRejectedValue(new Error("User not found"))
    const res = await availablePost(req("/api/username/available", { username: "alice" }))
    expect(res.status).toBe(401)
    expect(mockCreateClient).not.toHaveBeenCalled()
  })

  it("get: 200 with a session", async () => {
    mockProfile.mockResolvedValue({ user_id: "u2" })
    const res = await getPost(req("/api/username/get", { userId: "u1" }))
    expect(res.status).toBe(200)
    expect((await res.json()).username).toBe("alice")
  })

  it("available: 200 with a session", async () => {
    mockProfile.mockResolvedValue({ user_id: "u2" })
    const res = await availablePost(req("/api/username/available", { username: "bob" }))
    expect(res.status).toBe(200)
  })
})
