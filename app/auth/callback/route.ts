import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const next = requestUrl.searchParams.get("next")
  const type = requestUrl.searchParams.get("type")
  const access_token = requestUrl.hash?.split('access_token=')[1]?.split('&')[0]

  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  if (code) {
    await supabase.auth.exchangeCodeForSession(code)
  } else if (access_token) {
    await supabase.auth.setSession({
      access_token,
      refresh_token: ''
    })
  }

  if (type === 'recovery') {
    return NextResponse.redirect(requestUrl.origin + '/login/password')
  }

  if (next) {
    return NextResponse.redirect(requestUrl.origin + next)
  }

  return NextResponse.redirect(requestUrl.origin)
}
