/**
 * @jest-environment node
 *
 * Security tests for the retrieval API routes (IDOR fix).
 * Supabase, the session helper and the local embedding model are mocked.
 */
import { makeSupabaseMock } from "@/test-utils/supabase-mock"

jest.mock("@/lib/server/server-chat-helpers", () => ({
  getServerProfile: jest.fn(),
  checkApiKey: jest.fn()
}))
jest.mock("@/lib/generate-local-embedding", () => ({
  generateLocalEmbedding: jest.fn(async () => [0.1, 0.2, 0.3])
}))
jest.mock("@supabase/supabase-js", () => ({ createClient: jest.fn() }))

import { POST as retrievePost } from "@/app/api/retrieval/retrieve/route"
import { POST as processPost } from "@/app/api/retrieval/process/route"
import { POST as docxPost } from "@/app/api/retrieval/process/docx/route"
import { getServerProfile } from "@/lib/server/server-chat-helpers"
import { createClient } from "@supabase/supabase-js"

const mockProfile = getServerProfile as jest.Mock
const mockCreateClient = createClient as jest.Mock

const ME = "user-me"
const OTHER = "user-other"

let db: ReturnType<typeof makeSupabaseMock>

beforeEach(() => {
  db = makeSupabaseMock({
    files: [
      { id: "file-mine", user_id: ME },
      { id: "file-mine-2", user_id: ME },
      { id: "file-theirs", user_id: OTHER }
    ]
  })
  mockCreateClient.mockReturnValue(db.client)
  mockProfile.mockResolvedValue({ user_id: ME })
})

afterEach(() => jest.clearAllMocks())

const jsonReq = (url: string, body: unknown) =>
  new Request(`http://localhost${url}`, {
    method: "POST",
    body: JSON.stringify(body)
  })

describe("POST /api/retrieval/retrieve", () => {
  const url = "/api/retrieval/retrieve"
  const base = { userInput: "q", embeddingsProvider: "local", sourceCount: 5 }

  it("returns 401 without a session and never touches the DB", async () => {
    mockProfile.mockRejectedValue(new Error("User not found"))
    const res = await retrievePost(jsonReq(url, { ...base, fileIds: ["file-mine"] }))
    expect(res.status).toBe(401)
    expect(db.rpc).not.toHaveBeenCalled()
    expect(mockCreateClient).not.toHaveBeenCalled()
  })

  it.each([
    ["empty array", []],
    ["missing", undefined],
    ["not an array", "file-mine"],
    ["non-string element", ["file-mine", 42]]
  ])("returns 400 for fileIds %s", async (_name, fileIds) => {
    const res = await retrievePost(jsonReq(url, { ...base, fileIds }))
    expect(res.status).toBe(400)
    expect(db.rpc).not.toHaveBeenCalled()
  })

  it("returns 403 when any requested file is not owned, even if the first is", async () => {
    const res = await retrievePost(
      jsonReq(url, { ...base, fileIds: ["file-mine", "file-theirs"] })
    )
    expect(res.status).toBe(403)
    expect(db.rpc).not.toHaveBeenCalled()
  })

  it("returns 403 for ids that do not exist", async () => {
    const res = await retrievePost(
      jsonReq(url, { ...base, fileIds: ["file-mine", "does-not-exist"] })
    )
    expect(res.status).toBe(403)
    expect(db.rpc).not.toHaveBeenCalled()
  })

  it("returns 200 and calls the RPC with the verified ids for owned files", async () => {
    const res = await retrievePost(
      jsonReq(url, { ...base, fileIds: ["file-mine", "file-mine-2", "file-mine"] })
    )
    expect(res.status).toBe(200)
    expect(db.rpc).toHaveBeenCalledTimes(1)
    const [, args] = (db.rpc.mock.calls as any[])[0]
    expect(args.file_ids).toEqual(["file-mine", "file-mine-2"])
  })

  it("scopes the ownership query to the session user", async () => {
    await retrievePost(jsonReq(url, { ...base, fileIds: ["file-mine"] }))
    expect(db.calls).toContainEqual({
      table: "files",
      op: "eq",
      args: ["user_id", ME]
    })
  })
})

describe("POST /api/retrieval/process", () => {
  const form = (fileId: string) => {
    const fd = new FormData()
    fd.append("file", new File(["hello world. ".repeat(20)], "a.txt", { type: "text/plain" }))
    fd.append("file_id", fileId)
    fd.append("embeddingsProvider", "local")
    return new Request("http://localhost/api/retrieval/process", {
      method: "POST",
      body: fd
    })
  }

  it("returns 401 without a session", async () => {
    mockProfile.mockRejectedValue(new Error("User not found"))
    const res = await processPost(form("file-mine"))
    expect(res.status).toBe(401)
  })

  it("returns 404 for an unknown file", async () => {
    const res = await processPost(form("nope"))
    expect(res.status).toBe(404)
    expect(db.calls.some(c => c.op === "upsert")).toBe(false)
  })

  it("returns 403 for a file owned by someone else and writes nothing", async () => {
    const res = await processPost(form("file-theirs"))
    expect(res.status).toBe(403)
    expect(db.calls.some(c => c.op === "upsert" || c.op === "update")).toBe(false)
  })

  it("returns 200 for an owned file and writes file_items for that file", async () => {
    const res = await processPost(form("file-mine"))
    expect(res.status).toBe(200)
    const up = db.calls.find(c => c.op === "upsert")!
    expect(up.table).toBe("file_items")
    expect(up.args[0].every((r: any) => r.file_id === "file-mine" && r.user_id === ME)).toBe(true)
  })
})

describe("POST /api/retrieval/process/docx", () => {
  const url = "/api/retrieval/process/docx"
  const body = (fileId: string) => ({
    text: "hello world. ".repeat(20),
    fileId,
    embeddingsProvider: "local",
    fileExtension: "docx"
  })

  it("returns 401 without a session", async () => {
    mockProfile.mockRejectedValue(new Error("User not found"))
    const res = await docxPost(jsonReq(url, body("file-mine")))
    expect(res.status).toBe(401)
  })

  it("returns 404 for an unknown file", async () => {
    const res = await docxPost(jsonReq(url, body("nope")))
    expect(res.status).toBe(404)
  })

  it("returns 403 for a file owned by someone else and writes nothing", async () => {
    const res = await docxPost(jsonReq(url, body("file-theirs")))
    expect(res.status).toBe(403)
    expect(db.calls.some(c => c.op === "upsert" || c.op === "update")).toBe(false)
  })

  it("returns 200 for an owned file", async () => {
    const res = await docxPost(jsonReq(url, body("file-mine")))
    expect(res.status).toBe(200)
    expect(db.calls.find(c => c.op === "upsert")!.table).toBe("file_items")
  })
})
