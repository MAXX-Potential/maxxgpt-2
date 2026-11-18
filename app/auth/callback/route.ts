import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

function safeNext(next: string | null, origin: string): string {
  if (!next || !next.startsWith('/') || next.startsWith('//') || next.startsWith('/\\') || /[\u0000-\u001F\u007F]/.test(next)) return '/'
  try {
    const u = new URL(next, origin)
    if (u.origin !== origin || u.pathname.startsWith('//') || u.pathname.includes('\\')) return '/'
    return u.pathname + u.search + u.hash
  } catch { return '/' }
}

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

  const siteOrigin = (process.env.NEXT_PUBLIC_SITE_URL || requestUrl.origin).replace(/\/+$/, '')
  return NextResponse.redirect(siteOrigin + safeNext(next, siteOrigin))
}
