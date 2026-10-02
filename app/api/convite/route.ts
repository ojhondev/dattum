import { NextResponse } from "next/server";
import { criarSessao } from "@/lib/auth";
import { aceitarConvite } from "@/lib/equipe";
import { limitarIp, respostaLimite } from "@/lib/limite";
import { registrar } from "@/lib/registro";

export const runtime = "nodejs";

/** Aceite do convite: a pessoa cria a senha e já entra no painel da agência. */
export async function POST(req: Request) {
  if (await limitarIp(req, "convite", 20, 3600)) return respostaLimite(60);
  const b = await req.json().catch(() => null);
  const token = typeof b?.token === "string" ? b.token : "";
  const senha = typeof b?.senha === "string" ? b.senha : "";
  const nome = typeof b?.nome === "string" ? b.nome.slice(0, 120) : undefined;
  if (senha.length < 8) return NextResponse.json({ ok: false, error: "A senha precisa ter pelo menos 8 caracteres." }, { status: 400 });
  if (b?.aceite !== true) return NextResponse.json({ ok: false, error: "Confirme que leu os Termos de Uso e a Política de Privacidade." }, { status: 400 });
  const u = await aceitarConvite(token, senha, nome);
  if (!u) return NextResponse.json({ ok: false, error: "Este convite expirou ou já foi usado. Peça um novo ao dono da conta." }, { status: 410 });
  await criarSessao(u.agenciaId, u.id);
  await registrar({ agenciaId: u.agenciaId, usuarioId: u.id }, "Aceitou o convite e entrou na equipe");
  return NextResponse.json({ ok: true });
}
