import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "dattis_session";
const secret = new TextEncoder().encode(
  process.env.SESSION_SECRET ?? "dattis-dev-secret-troque-em-producao"
);

export async function proxy(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;

  let autenticado = false;
  if (token) {
    try {
      await jwtVerify(token, secret);
      autenticado = true;
    } catch {
      autenticado = false;
    }
  }

  if (!autenticado) {
    const url = req.nextUrl.clone();
    url.pathname = "/entrar";
    url.searchParams.set("proximo", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/painel/:path*"],
};
