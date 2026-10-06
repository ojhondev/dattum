import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { chaveDe } from "@/lib/segredo";

const COOKIE_NAME = "dattis_session";

// Domínio canônico (ex.: https://www.dattis.com.br). Enquanto for .vercel.app, nada é redirecionado.
const CANONICO = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");
const HOST_CANONICO = CANONICO ? new URL(CANONICO).host : null;
const REDIRECIONAR = !!HOST_CANONICO && !HOST_CANONICO.endsWith(".vercel.app") && process.env.VERCEL_ENV === "production";

export async function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // dattis.com.br e o endereço antigo *.vercel.app → domínio canônico (308, preserva caminho e SEO).
  // /api fica de fora: cron da Vercel e integrações chamam a URL diretamente.
  if (REDIRECIONAR && !pathname.startsWith("/api/")) {
    const host = req.headers.get("host") ?? "";
    const raiz = HOST_CANONICO!.replace(/^www\./, "");
    if (host !== HOST_CANONICO && (host === raiz || host.endsWith(".vercel.app"))) {
      return NextResponse.redirect(`${CANONICO}${pathname}${search}`, 308);
    }
  }

  if (!pathname.startsWith("/painel")) return NextResponse.next();

  const token = req.cookies.get(COOKIE_NAME)?.value;
  let autenticado = false;
  if (token) {
    try {
      await jwtVerify(token, chaveDe("sessao"));
      autenticado = true;
    } catch {
      autenticado = false;
    }
  }

  if (!autenticado) {
    const url = req.nextUrl.clone();
    url.pathname = "/entrar";
    url.searchParams.set("proximo", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.png|apple-icon.png).*)"],
};
