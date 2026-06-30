import { NextRequest, NextResponse } from "next/server"

export function proxy(req: NextRequest) {
  const auth = req.headers.get("authorization")
  const user = process.env.DASHBOARD_USER
  const pass = process.env.DASHBOARD_PASSWORD

  if (!user || !pass) {
    return new NextResponse("Dashboard não configurado", { status: 503 })
  }

  const expected = "Basic " + Buffer.from(`${user}:${pass}`).toString("base64")

  if (auth !== expected) {
    return new NextResponse("Acesso negado", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="n8n Radar"',
      },
    })
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
