import { chatRateLimiter } from "@/lib/rate-limiter"
import { checkApiKey, getServerProfile } from "@/lib/server/server-chat-helpers"
import { ServerRuntime } from "next"
import OpenAI from "openai"

export const runtime: ServerRuntime = "edge"

export async function GET() {
  try {
    let profile
    try {
      profile = await getServerProfile()
    } catch (error) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401
      })
    }

    if (!chatRateLimiter.check(profile.user_id).allowed) {
      return new Response(
        JSON.stringify({
          message: "Rate limit exceeded. Please try again later."
        }),
        { status: 429 }
      )
    }

    checkApiKey(profile.openai_api_key, "OpenAI")

    const openai = new OpenAI({
      apiKey: profile.openai_api_key || "",
      organization: profile.openai_organization_id
    })

    const myAssistants = await openai.beta.assistants.list({
      limit: 100
    })

    return new Response(JSON.stringify({ assistants: myAssistants.data }), {
      status: 200
    })
  } catch (error: any) {
    const errorMessage = error.error?.message || "An unexpected error occurred"
    const errorCode = error.status || 500
    return new Response(JSON.stringify({ message: errorMessage }), {
      status: errorCode
    })
  }
}
