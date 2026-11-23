import { isUsingEnvironmentKey } from "@/lib/envs"
import { getServerProfile } from "@/lib/server/server-chat-helpers"
import { createResponse } from "@/lib/server/server-utils"
import { KeyTypeT } from "@/types/key-type"
import { VALID_KEYS } from "@/types/valid-keys"

export async function POST(request: Request) {
  try {
    await getServerProfile()
  } catch (error) {
    return createResponse({ error: "Unauthorized" }, 401)
  }

  let json
  try {
    json = await request.json()
  } catch (error) {
    return createResponse({ error: "Invalid JSON body" }, 400)
  }
  const { key } = json as {
    key: string
  }

  if (!key) {
    return createResponse({ error: "Key type is required" }, 400)
  }

  if (!(key in VALID_KEYS)) {
    return createResponse({ error: "Invalid key type" }, 400)
  }

  const isUsing = isUsingEnvironmentKey(key as KeyTypeT)

  return createResponse({ isUsing }, 200)
}
