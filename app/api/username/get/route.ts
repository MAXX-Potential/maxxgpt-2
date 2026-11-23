import { getServerProfile } from "@/lib/server/server-chat-helpers"
import { Database } from "@/supabase/types"
import { createClient } from "@supabase/supabase-js"

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

    let body: { userId?: string } = {}
    try {
      body = await request.json()
    } catch (error) {
      // fall back to the query string below
    }
    const userId =
      body?.userId ?? new URL(request.url).searchParams.get("userId")

    // Self-only: a user may only look up their own username.
    if (typeof userId !== "string" || userId !== profile.user_id) {
      return new Response(JSON.stringify({ message: "Forbidden" }), {
        status: 403
      })
    }

    const supabaseAdmin = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("username")
      .eq("user_id", userId)
      .single()

    if (!data) {
      throw new Error(error.message)
    }

    return new Response(JSON.stringify({ username: data.username }), {
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
