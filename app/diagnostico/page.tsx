"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import { X, ChevronRight, MessageCircle } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { linkContato } from "@/lib/contato";
import "./diagnostico.css";

type AnswerKey = "sim" | "parcial" | "nao";

type Item = { id: string; text: string; help: string };

type Category = {
  key: string;
  name: string;
  color: string;
  soft: string;
  items: Item[];
};

const CATEGORIES: Category[] = [
  {
    key: "A",
    name: "Listas de clientes nos anúncios",
    color: "var(--aiki-red)",
    soft: "var(--aiki-red-soft)",
    items: [
      {
        id: "a1",
        text: "Vocês sobem planilha de clientes ou leads (e-mail, telefone) no Gerenciador de Anúncios ou no Google Ads pra criar público?",
        help: "Remarketing pra base, público semelhante (lookalike), lista de exclusão — tudo isso é dado pessoal do cliente indo pra plataforma de anúncio.",
      },
      {
        id: "a2",
        text: "Quem está nessa lista autorizou que o dado fosse usado em anúncio?",
        help: "“O cliente mandou a planilha” não é autorização do titular. Sem base legal, o público inteiro é irregular.",
      },
      {
        id: "a3",
        text: "Vocês apagam esses públicos quando a campanha ou o contrato com o cliente termina?",
        help: "Público esquecido na conta de anúncio continua sendo dado guardado sem motivo.",
      },
    ],
  },
  {
    key: "B",
    name: "Vendas e leads enviados ao Meta e Google",
    color: "var(--aiki-red)",
    soft: "var(--aiki-red-soft)",
    items: [
      {
        id: "b1",
        text: "Vocês configuram a API de Conversões do Meta ou as Conversões otimizadas do Google (envio de compra e lead pelo servidor, Stape, GTM server-side)?",
        help: "Essa integração manda e-mail e telefone de quem comprou direto pras plataformas — o visitante nem vê.",
      },
      {
        id: "b2",
        text: "Esse e-mail e telefone saem criptografados (hash) antes do envio?",
        help: "Sem criptografia, o dado do comprador trafega legível entre os sistemas.",
      },
      {
        id: "b3",
        text: "Alguém revisa essa integração depois que ela é instalada?",
        help: "Instalou uma vez e nunca mais olhou é o cenário mais comum — e o mais arriscado.",
      },
    ],
  },
  {
    key: "C",
    name: "Leads no WhatsApp, CRM e planilhas",
    color: "var(--aiki-orange)",
    soft: "var(--aiki-orange-soft)",
    items: [
      {
        id: "c1",
        text: "Os leads das campanhas (formulário, WhatsApp) passam pela agência ou ficam guardados com vocês?",
        help: "Planilha de lead, SDR da agência no WhatsApp, integração com CRM — tudo isso é tratamento de dado.",
      },
      {
        id: "c2",
        text: "Vocês sabem exatamente onde esses leads ficam guardados hoje?",
        help: "Drive pessoal do gestor de tráfego e planilha compartilhada por link são respostas comuns — e perigosas.",
      },
      {
        id: "c3",
        text: "Só quem precisa tem acesso a essas planilhas, CRMs e números de WhatsApp?",
        help: "Acesso sem controle vira problema quando alguém sai da agência levando a base.",
      },
    ],
  },
  {
    key: "D",
    name: "Pixel, cookies e páginas de captura",
    color: "var(--aiki-orange)",
    soft: "var(--aiki-orange-soft)",
    items: [
      {
        id: "d1",
        text: "Os sites e landing pages dos clientes têm banner de cookies que segura o pixel até o aceite?",
        help: "Pixel do Meta e tag do Google disparando antes do aceite é a falha mais encontrada em fiscalização.",
      },
      {
        id: "d2",
        text: "Os formulários (Formulário instantâneo do Meta, landing page) dizem pra que o dado será usado e linkam a política de privacidade?",
        help: "Política genérica copiada da internet não cobre o que a agência faz de verdade com o lead.",
      },
    ],
  },
  {
    key: "E",
    name: "Contrato com o cliente",
    color: "var(--aiki-orange-deep)",
    soft: "var(--aiki-orange-deep-soft)",
    items: [
      {
        id: "e1",
        text: "O contrato com cada cliente diz quem é dono do dado e o que a agência pode fazer com ele?",
        help: "Na LGPD o cliente é o controlador e a agência é a operadora. Sem isso escrito, a responsabilidade é dividida no pior momento.",
      },
      {
        id: "e2",
        text: "Está escrito quem responde se um lead vazar por falha da agência?",
        help: "A agência responde junto com o cliente (art. 42). Melhor estar no contrato do que no processo.",
      },
    ],
  },
  {
    key: "F",
    name: "Ferramentas que mexem no dado",
    color: "var(--aiki-orange-deep)",
    soft: "var(--aiki-orange-deep-soft)",
    items: [
      {
        id: "f1",
        text: "Vocês conseguem listar todas as ferramentas que tocam no lead do cliente?",
        help: "Meta, Google, CRM, Zapier, plataforma de WhatsApp, disparo de e-mail — cada uma precisa estar registrada.",
      },
      {
        id: "f2",
        text: "Essas ferramentas têm termos de proteção de dados conhecidos e guardados?",
        help: "A agência herda o risco de cada ferramenta que ela coloca no caminho do lead.",
      },
    ],
  },
  {
    key: "G",
    name: "Equipe e acessos",
    color: "var(--aiki-green)",
    soft: "var(--aiki-green-soft)",
    items: [
      {
        id: "g1",
        text: "A equipe (gestores, SDRs, freelas) sabe o que pode e o que não pode fazer com a base de leads?",
        help: "Não precisa ser curso formal — precisa existir e ser repetido.",
      },
      {
        id: "g2",
        text: "Quando alguém sai, vocês removem o acesso dele à BM, às contas de anúncio, ao CRM e às planilhas?",
        help: "Ex-colaborador com acesso à BM é risco de vazamento — e de BM derrubada.",
      },
    ],
  },
];

const SIGNAL: Category = {
  key: "H",
  name: "Pressão dos clientes",
  color: "var(--aiki-purple)",
  soft: "var(--aiki-purple-tint)",
  items: [
    {
      id: "h1",
      text: "Algum cliente já pediu comprovação de LGPD em contrato ou concorrência?",
      help: "Não entra no score de risco — mostra se a cobrança comercial já começou.",
    },
    {
      id: "h2",
      text: "Já perderam ou quase perderam um cliente por não ter isso?",
      help: "Se sim, cada mês sem resolver é receita em risco.",
    },
  ],
};

const STATES: { key: AnswerKey; label: string; points: number }[] = [
  { key: "sim", label: "Sim", points: 0 },
  { key: "parcial", label: "Parcial", points: 1 },
  { key: "nao", label: "Não / não sei", points: 2 },
];

function pointsFor(key: AnswerKey | undefined) {
  if (!key) return 0;
  const s = STATES.find((s) => s.key === key);
  return s ? s.points : 0;
}

function levelFor(pct: number) {
  if (pct <= 25) return { label: "Baixo", color: "var(--aiki-green)", soft: "var(--aiki-green-soft)" };
  if (pct <= 50) return { label: "Médio", color: "var(--aiki-orange)", soft: "var(--aiki-orange-soft)" };
  if (pct <= 75) return { label: "Alto", color: "var(--aiki-orange-deep)", soft: "var(--aiki-orange-deep-soft)" };
  return { label: "Crítico", color: "var(--aiki-red)", soft: "var(--aiki-red-soft)" };
}


type FlatQuestion = {
  item: Item;
  catKey: string;
  catName: string;
  color: string;
  isSignal: boolean;
};

const ALL_QUESTIONS: FlatQuestion[] = [
  ...CATEGORIES.flatMap((cat) =>
    cat.items.map((item) => ({ item, catKey: cat.key, catName: cat.name, color: cat.color, isSignal: false }))
  ),
  ...SIGNAL.items.map((item) => ({ item, catKey: SIGNAL.key, catName: SIGNAL.name, color: SIGNAL.color, isSignal: true })),
];

const TOTAL_QUESTIONS = ALL_QUESTIONS.length;
const RESULTS_STEP = TOTAL_QUESTIONS;
const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "ref"];

const soDigitos = (v: string) => v.replace(/\D/g, "");

function mascaraWhatsapp(v: string) {
  const d = soDigitos(v).slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, d.length - 4)}-${d.slice(-4)}`;
}

export default function AuditoriaAgencia() {
  const [answers, setAnswers] = useState<Record<string, AnswerKey>>({});
  const [responsavel, setResponsavel] = useState("");
  const [agencyName, setAgencyName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [leadId, setLeadId] = useState<string | null>(null);
  const [iniciando, setIniciando] = useState(false);
  const [erroIntro, setErroIntro] = useState("");
  const [popupAberto, setPopupAberto] = useState(false);
  const [step, setStep] = useState(-1); // -1 = intro, 0..TOTAL-1 = perguntas, RESULTS_STEP = resultado
  const [direction, setDirection] = useState<"fwd" | "back">("fwd");
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const resultadoEnviado = useRef(false);

  useEffect(() => {
    return () => {
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
    };
  }, []);

  const setAnswer = (id: string, key: AnswerKey) => setAnswers((a) => ({ ...a, [id]: key }));

  const goTo = (next: number, dir: "fwd" | "back") => {
    setDirection(dir);
    setStep(Math.max(-1, Math.min(RESULTS_STEP, next)));
  };

  const chooseAnswer = (id: string, key: AnswerKey) => {
    setAnswer(id, key);
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    advanceTimer.current = setTimeout(() => {
      goTo(step + 1, "fwd");
    }, 380);
  };

  const introValida = responsavel.trim().length >= 2 && agencyName.trim().length >= 2 && soDigitos(whatsapp).length >= 10;

  const comecar = async () => {
    if (!introValida) {
      setErroIntro("Preencha seu nome, a agência e o WhatsApp com DDD.");
      return;
    }
    setErroIntro("");
    if (leadId) return goTo(0, "fwd");
    setIniciando(true);
    const params = new URLSearchParams(window.location.search);
    const utm = Object.fromEntries(UTM_KEYS.flatMap((k) => (params.get(k) ? [[k, params.get(k) as string]] : [])));
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: responsavel, agencia: agencyName, whatsapp, utm }),
      });
      const data = await res.json();
      if (data.ok) setLeadId(data.id);
    } catch {
      // segue a auditoria mesmo sem conseguir registrar
    }
    setIniciando(false);
    goTo(0, "fwd");
  };

  const computed = useMemo(() => {
    const catBreakdown = CATEGORIES.map((cat) => {
      const answeredItems = cat.items.filter((item) => answers[item.id]);
      const pts = answeredItems.reduce((sum, item) => sum + pointsFor(answers[item.id]), 0);
      const answeredCat = answeredItems.length;
      const pct = answeredCat > 0 ? Math.round((pts / (answeredCat * 2)) * 100) : 0;
      return { ...cat, pct, answered: answeredCat, total: cat.items.length, pts, max: cat.items.length * 2 };
    });

    const totalPoints = catBreakdown.reduce((sum, c) => sum + c.pts, 0);
    const totalMax = catBreakdown.reduce((sum, c) => sum + c.max, 0);
    const answeredFromCategories = catBreakdown.reduce((sum, c) => sum + c.answered, 0);

    const signalCount = SIGNAL.items.reduce((n, item) => n + (answers[item.id] === "sim" ? 1 : 0), 0);
    const signalAnswered = SIGNAL.items.reduce((n, item) => n + (answers[item.id] ? 1 : 0), 0);
    const answeredTotal = answeredFromCategories + signalAnswered;

    const overallPct = totalMax > 0 ? Math.round((totalPoints / totalMax) * 100) : 0;
    const hasAnyRiskAnswer = CATEGORIES.some((cat) => cat.items.some((i) => answers[i.id]));
    const level = levelFor(overallPct);
    const top = [...catBreakdown].filter((c) => c.answered > 0 && c.pct > 0).sort((a, b) => b.pct - a.pct).slice(0, 3);
    const signalLabel = signalCount === 2 ? "Alta" : signalCount === 1 ? "Presente" : "Nenhuma";

    return { catBreakdown, answeredTotal, overallPct, hasAnyRiskAnswer, level, signalCount, signalLabel, top };
  }, [answers]);

  const inQuestion = step >= 0 && step < RESULTS_STEP;
  const inResults = step === RESULTS_STEP;

  // Ao chegar no resultado: grava no lead e abre o popup de envio ao especialista.
  useEffect(() => {
    if (!inResults) return;
    if (leadId && !resultadoEnviado.current) {
      resultadoEnviado.current = true;
      fetch(`/api/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          respostas: answers,
          score: computed.overallPct,
          nivel: computed.level.label,
          sinal: computed.signalLabel,
        }),
      }).catch(() => {});
    }
    const t = setTimeout(() => setPopupAberto(true), 700);
    return () => clearTimeout(t);
  }, [inResults]); // eslint-disable-line react-hooks/exhaustive-deps

  const mensagemEspecialista = useMemo(() => {
    const linhas = [
      "Olá! Fiz a Auditoria da sua agência na Dattis e quero falar com um especialista.",
      "",
      `Responsável: ${responsavel.trim()}`,
      `Agência: ${agencyName.trim()}`,
      `WhatsApp: ${mascaraWhatsapp(whatsapp)}`,
      "",
      `Resultado: risco ${computed.level.label.toLowerCase()} (${computed.overallPct}% de exposição)`,
    ];
    if (computed.top.length) {
      linhas.push("Pontos mais expostos:", ...computed.top.map((c) => `• ${c.name}: ${c.pct}%`));
    }
    linhas.push(`Pressão dos clientes por LGPD: ${computed.signalLabel.toLowerCase()}`);
    return linhas.join("\n");
  }, [responsavel, agencyName, whatsapp, computed]);

  const enviarEspecialista = () => {
    if (leadId) {
      fetch(`/api/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enviado: true }),
      }).catch(() => {});
    }
    setPopupAberto(false);
  };

  const resetAll = () => {
    setAnswers({});
    resultadoEnviado.current = false;
    setLeadId(null);
    goTo(-1, "back");
  };

  const gaugeStyle = {
    "--gauge-pct": computed.hasAnyRiskAnswer ? computed.overallPct : 0,
    "--gauge-color": computed.hasAnyRiskAnswer ? computed.level.color : "var(--aiki-carbon-20)",
  } as CSSProperties;

  const scoreChipStyle = {
    "--gauge-pct": computed.hasAnyRiskAnswer ? computed.overallPct : 0,
    "--gauge-color": computed.hasAnyRiskAnswer ? computed.level.color : "var(--aiki-carbon-40)",
  } as CSSProperties;

  const progressPct = step < 0 ? 0 : inResults ? 100 : Math.round((step / TOTAL_QUESTIONS) * 100);
  const current = inQuestion ? ALL_QUESTIONS[step] : null;

  const answered = current ? Boolean(answers[current.item.id]) : false;
  const leftEyebrow = inQuestion && current ? `${current.catKey} · ${current.catName}` : inResults ? "Resultado" : "Auditoria da sua agência";
  const leftTitle = inResults
    ? computed.hasAnyRiskAnswer
      ? `Risco ${computed.level.label.toLowerCase()}: ${computed.overallPct}% de exposição`
      : "Auditoria sem respostas ainda"
    : inQuestion
      ? "Cada resposta mostra onde sua agência está exposta — e onde seu cliente também está."
      : "Descubra quanto a sua agência está exposta à LGPD";

  const linkEspecialista = linkContato(mensagemEspecialista);

  return (
    <div className="diag-page fixed inset-0 z-[60] flex">
      <div className="relative hidden h-full w-1/2 shrink-0 overflow-hidden md:block">
        <div className="absolute inset-0 bg-rail bg-cover bg-center" style={{ backgroundImage: "url(/marketing/solucao-glow.png)" }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/10" />
        <div className="absolute inset-0 flex flex-col justify-end p-10 text-white">
          {step >= 0 && (
            <div className="diag-score-chip mb-8">
              <span className="diag-score-ring" style={scoreChipStyle}>
                <span className="diag-score-ring-inner">{computed.hasAnyRiskAnswer ? computed.overallPct : "—"}</span>
              </span>
              <span className="diag-score-chip-text text-white">
                <b>{computed.hasAnyRiskAnswer ? `Risco ${computed.level.label}` : "Aguardando respostas"}</b>
                <span className="!text-white/70">
                  {computed.answeredTotal}/{TOTAL_QUESTIONS} respondidas
                </span>
              </span>
            </div>
          )}
          <p className="mb-3 font-mono text-[13px] uppercase tracking-[0.04em] text-brand">{leftEyebrow}</p>
          <h2 className="max-w-md font-display text-[clamp(26px,3vw,38px)] leading-[1.12] text-white">{leftTitle}</h2>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col bg-white">
        <div className="h-1 shrink-0 bg-[#e3e3e1]">
          <div className="h-full bg-brand-strong transition-all duration-300" style={{ width: `${progressPct}%` }} />
        </div>

        <div className="flex shrink-0 items-center justify-between px-4 py-[17px] md:px-8">
          <Logo height={26} />
          <Link href="/" aria-label="Fechar" className="rounded-full p-2 text-[#59645f] hover:text-[#0a120f]">
            <X size={22} />
          </Link>
        </div>

        <div className={"flex flex-1 justify-center overflow-y-auto px-4 py-6 md:px-8 " + (inResults ? "items-start" : "items-center")}>
          {step === -1 && (
            <form
              className="diag-q w-full"
              key="intro"
              data-dir="fwd"
              onSubmit={(e) => {
                e.preventDefault();
                comecar();
              }}
            >
              <p className="diag-panel-label">Auditoria da sua agência</p>
              <h1 className="diag-intro-title">Sua agência e seus clientes estão protegidos?</h1>
              <p className="diag-intro-sub">
                {TOTAL_QUESTIONS} perguntas rápidas sobre como a sua agência lida com lead, pixel, lista de clientes e
                WhatsApp. No fim, você recebe o score de risco e pode enviar o resultado pra um especialista.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="diag-field sm:col-span-2">
                  <label htmlFor="responsavel">Nome do responsável</label>
                  <input id="responsavel" type="text" autoComplete="name" placeholder="Seu nome" value={responsavel} onChange={(e) => setResponsavel(e.target.value)} />
                </div>
                <div className="diag-field">
                  <label htmlFor="agencyName">Agência</label>
                  <input id="agencyName" type="text" autoComplete="organization" placeholder="Nome da agência" value={agencyName} onChange={(e) => setAgencyName(e.target.value)} />
                </div>
                <div className="diag-field">
                  <label htmlFor="whatsapp">WhatsApp</label>
                  <input
                    id="whatsapp"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    placeholder="(11) 99999-9999"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(mascaraWhatsapp(e.target.value))}
                  />
                </div>
              </div>
              {erroIntro && <p className="mt-3 text-[14px] text-[#c8641b]">{erroIntro}</p>}
              <p className="mt-4 text-[12px] leading-relaxed text-[#8b948f]">
                Usamos seus dados só pra falar com você sobre o resultado e sobre a Dattis.
              </p>
              <button type="submit" className="sr-only">
                Começar auditoria
              </button>
            </form>
          )}

          {inQuestion && current && (
            <div className="diag-q" key={step} data-dir={direction}>
              <p className="diag-q-count">
                Pergunta {step + 1} de {TOTAL_QUESTIONS}
              </p>
              <h1 className="diag-q-text">{current.item.text}</h1>
              <p className="diag-q-help">{current.item.help}</p>
              <div className="diag-answers">
                {(current.isSignal
                  ? [
                      { key: "sim" as AnswerKey, label: "Sim" },
                      { key: "nao" as AnswerKey, label: "Não" },
                    ]
                  : STATES
                ).map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    className={`diag-answer-btn ${opt.key}`}
                    aria-pressed={answers[current.item.id] === opt.key}
                    onClick={() => chooseAnswer(current.item.id, opt.key)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {inResults && (
            <div className="diag-q w-full max-w-2xl" key="results" data-dir="fwd">
              <p className="diag-panel-label">Auditoria completa</p>
              <h1 className="diag-intro-title" style={{ fontSize: "clamp(1.6rem, 3vw, 2.1rem)" }}>
                {agencyName.trim() || "Sua agência"} — resultado
              </h1>

              <div className="diag-results-grid">
                <div>
                  <p className="diag-panel-label">Score de risco</p>
                  <div className="diag-gauge-wrap">
                    <div className="diag-gauge" style={gaugeStyle}>
                      <div className="diag-gauge-inner">
                        <div className="diag-gauge-pct">{computed.hasAnyRiskAnswer ? `${computed.overallPct}%` : "—"}</div>
                        <div
                          className="diag-gauge-level"
                          style={{ color: computed.hasAnyRiskAnswer ? computed.level.color : "var(--aiki-carbon-60)" }}
                        >
                          {computed.hasAnyRiskAnswer ? computed.level.label : "aguardando"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="diag-panel-label" style={{ marginTop: "20px" }}>
                    Pressão dos clientes
                  </p>
                  <div className={`diag-signal-badge ${computed.signalCount > 0 ? "on" : "off"}`}>
                    <span>
                      {computed.signalCount === 2
                        ? "Já pediram prova e quase perderam cliente"
                        : computed.signalCount === 1
                          ? "Clientes já cobram conformidade"
                          : "Nenhuma cobrança identificada ainda"}
                    </span>
                    <b>{computed.signalCount > 0 ? computed.signalLabel : "—"}</b>
                  </div>
                </div>

                <div>
                  <p className="diag-panel-label">Por área</p>
                  <div className="diag-cb">
                    {computed.catBreakdown.map((c) => (
                      <div className="diag-cb-row" key={c.key}>
                        <span className="diag-cb-name">{c.name}</span>
                        <span className="diag-cb-track">
                          <span
                            className="diag-cb-fill"
                            style={{ width: `${c.answered > 0 ? c.pct : 0}%`, background: c.answered > 0 ? c.color : "var(--aiki-carbon-20)" }}
                          ></span>
                        </span>
                        <span className="diag-cb-val">{c.answered > 0 ? `${c.pct}%` : "—"}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="diag-cta">
                <h3>Você e seu cliente estão expostos. Corrija isso antes da multa.</h3>
                <p>
                  Envie o resultado pra um especialista da Dattis. Ele te mostra, pelo WhatsApp, o que corrigir primeiro na
                  agência e em cada cliente.
                </p>
                <div className="diag-cta-row">
                  <a className="diag-cta-btn" href={linkEspecialista} target="_blank" rel="noopener" onClick={enviarEspecialista}>
                    Enviar resultado para especialista →
                  </a>
                  <a className="diag-cta-btn ghost" href="/planos">
                    Ver planos
                  </a>
                </div>
              </div>

              <div className="diag-btn-row" style={{ marginTop: "18px" }}>
                <button className="diag-btn" onClick={() => goTo(TOTAL_QUESTIONS - 1, "back")}>
                  Revisar respostas
                </button>
                <button className="diag-btn" onClick={resetAll}>
                  Refazer auditoria
                </button>
              </div>

              <footer className="diag-foot">Dattis — auditoria de autoavaliação, não substitui parecer jurídico.</footer>
            </div>
          )}
        </div>

        {!inResults && (
          <div className="flex shrink-0 items-center justify-between gap-3 border-t border-[#e3e3e1] px-4 py-[17px] md:px-8">
            {step >= 0 ? (
              <button type="button" onClick={() => goTo(step - 1, "back")} className="text-[14px] text-[#59645f] hover:text-[#0a120f]">
                Voltar
              </button>
            ) : (
              <span />
            )}
            {step >= 0 && (
              <span className="font-mono text-[12px] uppercase tracking-[0.04em] text-[#59645f] md:hidden">
                {computed.hasAnyRiskAnswer ? `Risco ${computed.level.label} · ${computed.overallPct}%` : `${step + 1}/${TOTAL_QUESTIONS}`}
              </span>
            )}
            <button
              type="button"
              onClick={() => (step === -1 ? comecar() : goTo(step + 1, "fwd"))}
              disabled={(inQuestion && !answered) || (step === -1 && (!introValida || iniciando))}
              className="btn btn-dark btn-lg disabled:opacity-30"
            >
              {step === -1 ? (iniciando ? "Abrindo..." : "Começar auditoria") : step === TOTAL_QUESTIONS - 1 ? "Ver resultado" : "Continuar"}{" "}
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {popupAberto && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/50 sm:items-center sm:p-6" onClick={() => setPopupAberto(false)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="especialista-titulo"
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[94svh] w-full max-w-[520px] overflow-y-auto rounded-t-[28px] bg-white px-6 pb-6 pt-6 text-[#0a120f] sm:rounded-[32px] sm:px-9 sm:pb-9 sm:pt-8"
          >
            <div className="flex items-center justify-between">
              <Logo height={22} />
              <button type="button" onClick={() => setPopupAberto(false)} aria-label="Fechar" className="rounded-full p-2 text-[#59645f] hover:bg-[#f4f4f2] hover:text-[#0a120f]">
                <X size={20} />
              </button>
            </div>

            <p className="mt-6 font-mono text-[12px] uppercase tracking-[0.06em] text-[#59645f]">Resultado pronto</p>
            <h2 id="especialista-titulo" className="mt-2 font-display text-[26px] leading-tight sm:text-[30px]">
              Enviar resultado para especialista
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-[#26302c]">
              Um especialista da Dattis analisa suas respostas e te mostra, no WhatsApp, o que corrigir primeiro — na agência
              e nos clientes.
            </p>

            <div className="mt-6 rounded-[20px] border border-[#e3e3e1] p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <span className="text-[14px] text-[#59645f]">{agencyName.trim()}</span>
                <span className="font-display text-[22px]" style={{ color: computed.level.color }}>
                  {computed.overallPct}% · {computed.level.label}
                </span>
              </div>
              {computed.top.length > 0 && (
                <ul className="mt-3 flex flex-col gap-1.5 border-t border-[#e3e3e1] pt-3 text-[14px] text-[#26302c]">
                  {computed.top.map((c) => (
                    <li key={c.key} className="flex justify-between gap-3">
                      <span>{c.name}</span>
                      <span className="tabular-nums text-[#59645f]">{c.pct}%</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <a
              href={linkEspecialista}
              target="_blank"
              rel="noopener"
              onClick={enviarEspecialista}
              className="btn btn-dark btn-lg mt-6 w-full whitespace-normal text-center"
            >
              <MessageCircle size={18} /> Enviar resultado para especialista
            </a>
            <button type="button" onClick={() => setPopupAberto(false)} className="mx-auto mt-3 block text-[14px] text-[#59645f] hover:text-[#0a120f]">
              Agora não
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
