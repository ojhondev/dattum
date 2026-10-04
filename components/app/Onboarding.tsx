"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Copy, FileBarChart, FileText, Globe, Cookie, Loader2, MessageCircle } from "lucide-react";
import { FLUXOS, type FlowKey } from "@/lib/fluxos";
import { CATALOGO_FERRAMENTAS, operacoesDasFerramentas } from "@/lib/ferramentas";
import { linkWhatsappPara } from "@/lib/contato";
import { SeletorFerramentasCorpo, type SelecaoFerramentas } from "@/components/app/SeletorFerramentas";
import type { FerramentaPropria } from "@/components/app/AdicionarFerramenta";

export type DadosAgenciaOnboarding = {
  nome: string;
  email: string;
  cnpj: string;
  responsavelNome: string;
  responsavelCargo: string;
  whatsapp: string;
  endereco: string;
};

type Cliente = { nome: string; site: string; cnpj: string; contatoNome: string; contatoWhatsapp: string; contatoEmail: string };
const CLIENTE_VAZIO: Cliente = { nome: "", site: "", cnpj: "", contatoNome: "", contatoWhatsapp: "", contatoEmail: "" };

type Passo = "boas-vindas" | "agencia" | "cliente" | "responsavel" | "ferramentas" | "operacoes" | "revisao" | "criando" | "assinar" | "pronto";

/**
 * Preenchimento guiado: uma pergunta por tela, como a auditoria. No fim, a Dattis cria o cliente
 * com registro (RAT), contrato (DPA) e ferramentas. Primeiro a pessoa diz as ferramentas que usa (o que
 * ela sabe responder) e a Dattis deduz as operações para ela só confirmar. No fim, a agência assina o
 * contrato e já manda o link para o cliente assinar pelo WhatsApp.
 * modo "agencia": começa pelos dados da agência (primeiro acesso). modo "cliente": só o cliente novo.
 */
export function Onboarding({
  modo,
  agencia,
  podeEditarAgencia,
  ferramentasProprias = [],
}: {
  modo: "agencia" | "cliente";
  agencia: DadosAgenciaOnboarding;
  podeEditarAgencia: boolean;
  ferramentasProprias?: FerramentaPropria[];
}) {
  const router = useRouter();
  const comAgencia = modo === "agencia" && podeEditarAgencia;
  const ordem: Passo[] = useMemo(
    () => [...(modo === "agencia" ? (["boas-vindas"] as Passo[]) : []), ...(comAgencia ? (["agencia"] as Passo[]) : []), "cliente", "responsavel", "ferramentas", "operacoes", "revisao"],
    [modo, comAgencia],
  );
  const [passo, setPasso] = useState<Passo>(ordem[0]);
  const [ag, setAg] = useState(agencia);
  const [cli, setCli] = useState<Cliente>(CLIENTE_VAZIO);
  const [flows, setFlows] = useState<FlowKey[]>([]);
  const [ferr, setFerr] = useState<SelecaoFerramentas>({ chaves: [], personalizadas: [] });
  const [flowsTocados, setFlowsTocados] = useState(false);
  const [erro, setErro] = useState("");
  const [feitos, setFeitos] = useState<string[]>([]);
  const [criado, setCriado] = useState<{ id: string; dpaId: string } | null>(null);
  const [ass, setAss] = useState({ nome: agencia.responsavelNome, cargo: agencia.responsavelCargo, aceite: false });
  const [assinando, setAssinando] = useState(false);
  const [link, setLink] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);

  const i = ordem.indexOf(passo);
  const total = ordem.length;
  const fim = passo === "criando" || passo === "assinar" || passo === "pronto";
  const progresso = fim ? 1 : Math.max(i, 0) / total;

  const alternarFluxo = (k: FlowKey) => {
    setFlowsTocados(true);
    setFlows((x) => (x.includes(k) ? x.filter((y) => y !== k) : [...x, k]));
  };

  // Operações que as ferramentas marcadas indicam (catálogo da Dattis + ferramentas da agência).
  const deduzidas = () => {
    const todas = [...ferramentasProprias, ...CATALOGO_FERRAMENTAS];
    return operacoesDasFerramentas(ferr.chaves.map((k) => todas.find((f) => f.chave === k)).filter((f): f is (typeof todas)[number] => !!f)) as FlowKey[];
  };

  const validar = (): string => {
    if (passo === "agencia" && !ag.nome.trim()) return "Informe o nome da agência.";
    if (passo === "cliente" && !cli.nome.trim()) return "Informe o nome do cliente.";
    if (passo === "cliente" && cli.site.trim() && !/^(https?:\/\/)?[^\s/]+\.[^\s]{2,}/i.test(cli.site.trim())) return "Esse site não parece um endereço válido (ex.: lojaaurora.com.br).";
    if (passo === "responsavel" && cli.contatoEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(cli.contatoEmail.trim())) return "Esse e-mail não parece válido.";
    if (passo === "operacoes" && flows.length === 0) return "Marque pelo menos uma operação. É ela que vira o registro e o contrato.";
    return "";
  };

  const avancar = () => {
    const e = validar();
    setErro(e);
    if (e) return;
    if (passo === "revisao") return criar();
    if (passo === "assinar") return assinarEGerarLink();
    if (passo === "ferramentas" && !flowsTocados) setFlows(deduzidas());
    setPasso(ordem[i + 1]);
  };
  const voltar = () => {
    setErro("");
    if (i > 0) setPasso(ordem[i - 1]);
  };

  const pular = async () => {
    await fetch("/api/agencia/onboarding", { method: "POST" }).catch(() => null);
    router.push("/painel");
    router.refresh();
  };

  const json = async (url: string, method: string, body?: unknown) => {
    const r = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined })
      .then((x) => x.json())
      .catch(() => ({ ok: false, error: "Sem conexão. Tente de novo." }));
    if (!r.ok) throw new Error(r.error ?? "Não foi possível salvar.");
    return r;
  };

  const criar = async () => {
    setPasso("criando");
    setFeitos([]);
    setErro("");
    const marcar = (t: string) => setFeitos((f) => [...f, t]);
    try {
      if (comAgencia) {
        await json("/api/agencia", "PATCH", ag);
        marcar("Dados da agência salvos nos contratos");
      }
      const r = await json("/api/contas", "POST", {
        ...cli,
        flows: Object.fromEntries(flows.map((f) => [f, true])),
        ferramentas: ferr.chaves,
        ferramentasPersonalizadas: ferr.personalizadas,
      });
      marcar(`Registro de atividades (RAT) gerado com ${flows.length} atividade(s)`);
      // Grava exatamente o que ficou marcado (inclusive o que a agência desmarcou das operações).
      await json(`/api/contas/${r.conta.id}/ferramentas`, "PUT", ferr);
      marcar(`${ferr.chaves.length + ferr.personalizadas.length} ferramenta(s) na lista de subprocessadores`);
      marcar("Contrato de dados (DPA) pronto para assinar");
      if (modo === "agencia") await json("/api/agencia/onboarding", "POST");
      setCriado({ id: r.conta.id, dpaId: r.dpaId });
      setAss((a) => ({ ...a, nome: a.nome || ag.responsavelNome, cargo: a.cargo || ag.responsavelCargo }));
      setTimeout(() => setPasso("assinar"), 500);
    } catch (e) {
      setErro((e as Error).message);
      setPasso("revisao");
    }
  };

  const assinarEGerarLink = async () => {
    if (!ass.nome.trim() || !ass.cargo.trim() || !ass.aceite) return setErro("Preencha nome e cargo e confirme que leu e concorda com o contrato.");
    if (!criado) return;
    setAssinando(true);
    setErro("");
    try {
      await json(`/api/dpa/${criado.dpaId}/assinar`, "POST", { nome: ass.nome.trim(), cargo: ass.cargo.trim(), aceite: true });
      const l = await json(`/api/dpa/${criado.dpaId}/link`, "POST");
      setLink(l.url);
      setPasso("pronto");
    } catch (e) {
      setErro((e as Error).message);
    }
    setAssinando(false);
  };

  const mensagemAssinatura = () => {
    const primeiro = cli.contatoNome.trim().split(" ")[0];
    return `${primeiro ? `Olá, ${primeiro}!` : "Olá!"} Segue o contrato de dados entre a ${ag.nome || "agência"} e a ${nomeCli}, exigido pela LGPD, para você assinar. É pelo celular e leva 2 minutos: ${link}`;
  };

  const outroCliente = () => {
    setCli(CLIENTE_VAZIO);
    setFlows([]);
    setFerr({ chaves: [], personalizadas: [] });
    setFlowsTocados(false);
    setCriado(null);
    setLink(null);
    setCopiado(false);
    setAss((a) => ({ ...a, aceite: false }));
    setFeitos([]);
    setPasso("cliente");
    router.refresh();
  };

  const campoAg = (k: keyof DadosAgenciaOnboarding) => ({ id: `ag-${k}`, value: ag[k], onChange: (e: React.ChangeEvent<HTMLInputElement>) => setAg((x) => ({ ...x, [k]: e.target.value })) });
  const campoCli = (k: keyof Cliente) => ({ id: `cli-${k}`, value: cli[k], onChange: (e: React.ChangeEvent<HTMLInputElement>) => setCli((x) => ({ ...x, [k]: e.target.value })) });
  const nomeCli = cli.nome.trim() || "o cliente";

  return (
    <div className="mx-auto flex min-h-[calc(100svh-180px)] w-full max-w-3xl flex-col">
      {/* Progresso */}
      <div className="flex items-center gap-4">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
          <div className="h-full rounded-full bg-brand-strong transition-[width] duration-500" style={{ width: `${progresso * 100}%` }} />
        </div>
        {!fim && (
          <span className="font-mono text-[12px] tabular-nums text-muted">
            {i + 1} / {total}
          </span>
        )}
        {modo === "agencia" && !fim && (
          <button type="button" onClick={pular} className="text-[13px] text-muted underline-offset-2 hover:text-ink hover:underline">
            Pular por agora
          </button>
        )}
      </div>

      <form
        key={passo}
        className="rise flex flex-1 flex-col pt-10 sm:pt-14"
        onSubmit={(e) => {
          e.preventDefault();
          avancar();
        }}
      >
        {passo === "boas-vindas" && (
          <Tela
            rotulo="Bem-vindo à Dattis"
            pergunta="Vamos deixar a documentação da sua agência pronta"
            ajuda="São 6 perguntas rápidas sobre a agência e o seu primeiro cliente. No fim, a Dattis monta sozinha o registro de atividades, o contrato com o cliente e a lista de ferramentas. Leva uns 4 minutos."
          >
            <ul className="grid gap-2 sm:grid-cols-3">
              {["Registro do que é feito com os dados (RAT)", "Contrato de dados pronto para assinar (DPA)", "Ferramentas na lista de subprocessadores"].map((t) => (
                <li key={t} className="bloco flex items-start gap-2.5 p-4 text-[14px] leading-snug text-body">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-strong text-rail">
                    <Check size={12} strokeWidth={3} />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </Tela>
        )}

        {passo === "agencia" && (
          <Tela rotulo="Sua agência" pergunta="Confira os dados da agência" ajuda="Eles entram na qualificação de todos os contratos que a Dattis gera. Só o nome é obrigatório agora.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo rotulo="Nome da agência" {...campoAg("nome")} autoFocus />
              <Campo rotulo="CNPJ" placeholder="00.000.000/0001-00" {...campoAg("cnpj")} />
              <Campo rotulo="Responsável legal" placeholder="Nome de quem assina" {...campoAg("responsavelNome")} />
              <Campo rotulo="Cargo" placeholder="Sócio, diretor..." {...campoAg("responsavelCargo")} />
              <Campo rotulo="WhatsApp da agência" inputMode="tel" placeholder="(11) 99999-9999" {...campoAg("whatsapp")} />
              <Campo rotulo="Endereço" placeholder="Rua, número, cidade/UF" {...campoAg("endereco")} />
            </div>
          </Tela>
        )}

        {passo === "cliente" && (
          <Tela
            rotulo={modo === "cliente" ? "Novo cliente" : "Primeiro cliente"}
            pergunta="Qual cliente vamos colocar em dia?"
            ajuda="Com o site, a vigilância diária passa a conferir segurança e privacidade dele todo dia às 6h."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo rotulo="Nome do cliente" placeholder="Ex.: Loja Aurora" {...campoCli("nome")} autoFocus className="sm:col-span-2" grande />
              <Campo rotulo="Site ou loja" inputMode="url" placeholder="lojaaurora.com.br" {...campoCli("site")} />
              <Campo rotulo="CNPJ (opcional)" placeholder="00.000.000/0001-00" {...campoCli("cnpj")} />
            </div>
          </Tela>
        )}

        {passo === "responsavel" && (
          <Tela rotulo={nomeCli} pergunta={`Quem responde pela ${nomeCli}?`} ajuda="É para essa pessoa que vai o link de assinatura do contrato. Dá para preencher depois.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo rotulo="Nome do responsável" {...campoCli("contatoNome")} autoFocus className="sm:col-span-2" grande />
              <Campo rotulo="WhatsApp" inputMode="tel" placeholder="(11) 99999-9999" {...campoCli("contatoWhatsapp")} />
              <Campo rotulo="E-mail" type="email" {...campoCli("contatoEmail")} />
            </div>
          </Tela>
        )}

        {passo === "operacoes" && (
          <Tela
            rotulo={nomeCli}
            pergunta={`Confira o que a agência faz com os dados da ${nomeCli}`}
            ajuda={
              flows.length
                ? "Já marcamos o que as ferramentas indicam. Confira e marque o que faltar: cada item vira uma atividade no registro e uma cláusula no contrato."
                : "Marque tudo o que se aplica: cada item vira uma atividade no registro e uma cláusula no contrato."
            }
          >
            <div className="grid gap-2.5 sm:grid-cols-2">
              {FLUXOS.map((f) => {
                const on = flows.includes(f.key);
                return (
                  <button
                    key={f.key}
                    type="button"
                    aria-pressed={on}
                    onClick={() => alternarFluxo(f.key)}
                    className={
                      "flex items-start gap-3 rounded-2xl border p-4 text-left transition-colors " +
                      (on ? "border-brand-strong bg-brand-tint" : "border-line bg-surface hover:border-line-strong")
                    }
                  >
                    <span className={"mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border " + (on ? "border-brand-strong bg-brand-strong text-rail" : "border-line-strong")}>
                      {on && <Check size={13} strokeWidth={3} />}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[15px] font-medium leading-snug text-ink">{f.titulo}</span>
                      <span className="mt-1 block text-[12.5px] leading-snug text-muted">{f.comoChamam}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </Tela>
        )}

        {passo === "ferramentas" && (
          <Tela
            rotulo={nomeCli}
            pergunta={`Quais ferramentas a agência usa para a ${nomeCli}?`}
            ajuda="Marque tudo o que recebe dados dele: anúncios, CRM, WhatsApp, e-mail, planilhas, loja virtual... Procure pelo nome ou pela categoria."
          >
            <SeletorFerramentasCorpo
              valor={ferr}
              proprias={ferramentasProprias}
              altura="h-[min(48vh,460px)]"
              onChange={setFerr}
            />
          </Tela>
        )}

        {passo === "revisao" && (
          <Tela rotulo="Revisão" pergunta="Tudo certo? A Dattis monta o resto" ajuda="Você pode mudar qualquer coisa depois, na página do cliente.">
            <dl className="bloco divide-y divide-line text-[14.5px]">
              {[
                ...(comAgencia ? [["Agência", [ag.nome, ag.cnpj && `CNPJ ${ag.cnpj}`].filter(Boolean).join(" · "), "agencia"]] : []),
                ["Cliente", [cli.nome, cli.site].filter(Boolean).join(" · "), "cliente"],
                ["Responsável", [cli.contatoNome, cli.contatoWhatsapp, cli.contatoEmail].filter(Boolean).join(" · ") || "Preencher depois", "responsavel"],
                ["Operações", FLUXOS.filter((f) => flows.includes(f.key)).map((f) => f.curto).join(", "), "operacoes"],
                ["Ferramentas", `${ferr.chaves.length + ferr.personalizadas.length} marcada(s)`, "ferramentas"],
              ].map(([k, v, alvo]) => (
                <div key={k} className="flex items-start gap-4 px-5 py-3.5">
                  <dt className="w-28 shrink-0 text-muted">{k}</dt>
                  <dd className="min-w-0 flex-1 text-ink">{v}</dd>
                  <button type="button" onClick={() => setPasso(alvo as Passo)} className="shrink-0 text-[13px] text-muted underline-offset-2 hover:text-ink hover:underline">
                    Mudar
                  </button>
                </div>
              ))}
            </dl>
          </Tela>
        )}

        {passo === "criando" && (
          <Tela rotulo="Montando" pergunta={`Montando a documentação da ${nomeCli}`}>
            <ul className="flex flex-col gap-3">
              {feitos.map((t) => (
                <li key={t} className="rise flex items-center gap-3 text-[15.5px] text-ink">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-brand-strong text-rail">
                    <Check size={14} strokeWidth={3} />
                  </span>
                  {t}
                </li>
              ))}
              <li className="flex items-center gap-3 text-[15px] text-muted">
                <Loader2 size={20} className="animate-spin" /> Trabalhando...
              </li>
            </ul>
          </Tela>
        )}

        {passo === "assinar" && criado && (
          <Tela
            rotulo="Contrato"
            pergunta={`Assine o contrato e mande para a ${nomeCli}`}
            ajuda="O contrato só vale com as duas assinaturas. Assine pela agência agora e a Dattis gera o link para o cliente assinar pelo celular."
          >
            <div className="bloco flex flex-col gap-4 p-5 sm:p-6">
              <a href={`/api/dpa/${criado.dpaId}/pdf`} target="_blank" rel="noopener" className="barra-btn self-start">
                <FileText size={15} /> Ler o contrato (PDF)
              </a>
              <div className="grid gap-4 sm:grid-cols-2">
                <Campo rotulo="Quem assina pela agência" id="ass-nome" value={ass.nome} onChange={(e) => setAss((a) => ({ ...a, nome: e.target.value }))} autoFocus />
                <Campo rotulo="Cargo" id="ass-cargo" value={ass.cargo} placeholder="Sócio, diretor..." onChange={(e) => setAss((a) => ({ ...a, cargo: e.target.value }))} />
              </div>
              <label htmlFor="ass-aceite" className="flex items-start gap-3 text-[14.5px] leading-snug text-body">
                <input id="ass-aceite" type="checkbox" checked={ass.aceite} onChange={(e) => setAss((a) => ({ ...a, aceite: e.target.checked }))} className="mt-0.5 h-4 w-4 accent-[var(--color-brand-strong)]" />
                Li e concordo com o contrato de dados entre a {ag.nome || "agência"} e a {nomeCli}, e assino em nome da agência.
              </label>
            </div>
          </Tela>
        )}

        {passo === "pronto" && criado && (
          <Tela
            rotulo="Pronto"
            pergunta={`A ${nomeCli} já está documentada`}
            ajuda={link ? "Agora é só mandar o link para o cliente assinar. Depois, os passos abaixo deixam tudo completo:" : "O registro, o contrato e a lista de ferramentas estão no ar. Faltam só os passos que dependem de você:"}
          >
            {link && (
              <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-brand-strong bg-brand-tint p-5">
                <p className="text-[15px] font-medium text-ink">
                  Contrato assinado pela agência. Mande para {cli.contatoNome.trim() || "o responsável do cliente"} assinar:
                </p>
                <div className="flex flex-wrap gap-2">
                  <a
                    href={
                      linkWhatsappPara(cli.contatoWhatsapp, mensagemAssinatura()) ?? `https://wa.me/?text=${encodeURIComponent(mensagemAssinatura())}`
                    }
                    target="_blank"
                    rel="noopener"
                    className="barra-btn primario"
                  >
                    <MessageCircle size={15} /> Enviar no WhatsApp
                  </a>
                  <button
                    type="button"
                    className="barra-btn"
                    onClick={async () => {
                      await navigator.clipboard.writeText(link).catch(() => null);
                      setCopiado(true);
                    }}
                  >
                    <Copy size={14} /> {copiado ? "Link copiado" : "Copiar link"}
                  </button>
                </div>
              </div>
            )}
            <ul className="grid gap-2.5 sm:grid-cols-2">
              {[
                ...(link ? [] : [{ icon: FileText, t: "Assinar o contrato e mandar o link ao cliente", d: "Com as duas assinaturas, o certificado e o selo saem sozinhos.", href: `/painel/contas/${criado.id}?aba=contrato` }]),
                { icon: Globe, t: "Publicar a política de privacidade", d: "Link pronto para o site e para o formulário de anúncio.", href: `/painel/contas/${criado.id}?aba=site` },
                { icon: Cookie, t: "Instalar o aviso de cookies", d: "Segura o pixel até o visitante aceitar.", href: `/painel/cookies?site=${criado.id}` },
                { icon: FileBarChart, t: "Gerar o relatório para o cliente", d: "A situação dele em PDF, em um clique.", href: `/painel/contas/${criado.id}/dat?imprimir=1` },
              ].map((p) => (
                <li key={p.t}>
                  <Link href={p.href} className="bloco flex h-full items-start gap-3 p-4 transition-colors hover:border-line-strong">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-canvas text-muted">
                      <p.icon size={17} />
                    </span>
                    <span>
                      <span className="block text-[14.5px] font-medium leading-snug text-ink">{p.t}</span>
                      <span className="mt-0.5 block text-[13px] leading-snug text-muted">{p.d}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Tela>
        )}

        {erro && <p className="mt-6 rounded-xl bg-warn-tint px-4 py-3 text-[14px] text-warn">{erro}</p>}

        {/* Rodapé de navegação */}
        <div className="mt-auto flex items-center justify-between gap-3 pt-10">
          {passo === "pronto" && criado ? (
            <>
              <button type="button" onClick={outroCliente} className="barra-btn">
                Cadastrar outro cliente
              </button>
              <Link href={`/painel/contas/${criado.id}`} className="barra-btn primario !h-11 !px-5">
                Abrir o cliente <ArrowRight size={16} />
              </Link>
            </>
          ) : passo === "assinar" ? (
            <>
              <button type="button" onClick={() => setPasso("pronto")} className="barra-btn">
                Deixar para depois
              </button>
              <button type="submit" disabled={assinando} className="barra-btn primario !h-11 !px-5">
                {assinando ? "Assinando..." : "Assinar e gerar link"} <ArrowRight size={16} />
              </button>
            </>
          ) : passo === "criando" ? null : (
            <>
              <button type="button" onClick={voltar} disabled={i === 0} className="barra-btn disabled:invisible">
                <ArrowLeft size={15} /> Voltar
              </button>
              <div className="flex items-center gap-3">
                <span className="hidden text-[12px] text-faint sm:inline">Enter ↵</span>
                <button type="submit" className="barra-btn primario !h-11 !px-5">
                  {passo === "boas-vindas" ? "Começar" : passo === "revisao" ? "Criar tudo" : "Continuar"} <ArrowRight size={16} />
                </button>
              </div>
            </>
          )}
        </div>
      </form>
    </div>
  );
}

function Tela({ rotulo, pergunta, ajuda, children }: { rotulo: string; pergunta: string; ajuda?: string; children?: React.ReactNode }) {
  return (
    <div>
      <p className="font-mono text-[12px] uppercase tracking-[0.06em] text-brand-ink">{rotulo}</p>
      <h1 className="mt-3 font-display text-[clamp(1.8rem,4vw,2.6rem)] leading-[1.1] text-ink">{pergunta}</h1>
      {ajuda && <p className="mt-3 max-w-2xl text-[16px] leading-relaxed text-muted">{ajuda}</p>}
      {children && <div className="mt-8">{children}</div>}
    </div>
  );
}

function Campo({
  rotulo,
  className = "",
  grande = false,
  ...props
}: { rotulo: string; className?: string; grande?: boolean } & React.InputHTMLAttributes<HTMLInputElement> & { id: string }) {
  return (
    <label htmlFor={props.id} className={"flex flex-col gap-1.5 " + className}>
      <span className="text-[13px] text-muted">{rotulo}</span>
      <input
        {...props}
        className={
          "w-full rounded-xl border border-line bg-surface px-4 text-ink outline-none transition-colors placeholder:text-faint focus:border-brand-strong " +
          (grande ? "py-3.5 text-[18px]" : "py-3 text-[15px]")
        }
      />
    </label>
  );
}
