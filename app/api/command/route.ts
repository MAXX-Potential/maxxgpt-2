import { CHAT_SETTING_LIMITS } from "@/lib/chat-setting-limits"
import { chatRateLimiter } from "@/lib/rate-limiter"
import { checkApiKey, getServerProfile } from "@/lib/server/server-chat-helpers"
import OpenAI from "openai"

export const runtime = "edge"

export async function POST(request: Request) {
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

    let json
    try {
      json = await request.json()
    } catch (error) {
      return new Response(JSON.stringify({ message: "Invalid JSON body" }), {
        status: 400
      })
    }
    const { input } = json as {
      input: string
    }

    checkApiKey(profile.openai_api_key, "OpenAI")

    const openai = new OpenAI({
      apiKey: profile.openai_api_key || "",
      organization: profile.openai_organization_id
    })

    const response = await openai.chat.completions.create({
      model: "gpt-4-1106-preview",
      messages: [
        {
          role: "system",
          content: "Respond to the user."
        },
        {
          role: "user",
          content: input
        }
      ],
      temperature: 0,
      max_tokens:
        CHAT_SETTING_LIMITS["gpt-4-1106-preview"].MAX_TOKEN_OUTPUT_LENGTH
      //   response_format: { type: "json_object" }
      //   stream: true
    })

    const content = response.choices[0].message.content

    return new Response(JSON.stringify({ content }), {
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
