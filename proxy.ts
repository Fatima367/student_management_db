import { updateSession } from "@/lib/supabase/middleware"
import { NextRequest, NextResponse } from "next/server"

const protectedRoutes = ["/dashboard", "/students", "/courses", "/attendance", "/grades", "/fees", "/notifications", "/admin"]
const publicRoutes = ["/login", "/signup"]

export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname
  const isProtected = protectedRoutes.some((route) => path.startsWith(route))
  const isPublic = publicRoutes.some((route) => path.startsWith(route))

  const { response, user } = await updateSession(req)

  if (isProtected && !user) {
    const url = new URL("/login", req.url)
    url.searchParams.set("redirect", path)
    return NextResponse.redirect(url)
  }

  if (isPublic && user) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  return response
}
