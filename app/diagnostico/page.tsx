"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import { X, ChevronRight } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
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
    name: "Custom Audiences",
    color: "var(--aiki-red)",
    soft: "var(--aiki-red-soft)",
    items: [
      {
        id: "a1",
        text: "Fazem upload de listas de clientes (e-mail/telefone) para Custom Audiences no Meta ou Google?",
        help: "Cada upload é tratamento de dado pessoal feito em nome do cliente.",
      },
      {
        id: "a2",
        text: "Existe consentimento documentado do titular pra esse uso específico?",
        help: "Sem isso, a base legal do tratamento é frágil — “o cliente mandou” não é base legal.",
      },
      {
        id: "a3",
        text: "Sabem por quanto tempo essas listas ficam retidas nas plataformas de anúncio?",
        help: "Retenção indevida é uma das falhas mais comuns e menos percebidas.",
      },
    ],
  },
  {
    key: "B",
    name: "CAPI / Enhanced Conversions",
    color: "var(--aiki-red)",
    soft: "var(--aiki-red-soft)",
    items: [
      {
        id: "b1",
        text: "Implementam CAPI (Meta) ou Enhanced Conversions (Google) enviando dado pessoal do servidor?",
        help: "Envio server-side de e-mail/telefone é tratamento de dado, mesmo “por trás” do pixel.",
      },
      {
        id: "b2",
        text: "Esse dado é hasheado (SHA-256) antes de enviar?",
        help: "Sem hashing correto, o dado pessoal trafega em texto reconhecível.",
      },
      {
        id: "b3",
        text: "Existe revisão técnica periódica dessa implementação?",
        help: "Implementado uma vez e nunca revisado é o padrão mais comum de falha.",
      },
    ],
  },
  {
    key: "C",
    name: "Leads / CRM / WhatsApp",
    color: "var(--aiki-orange)",
    soft: "var(--aiki-orange-soft)",
    items: [
      {
        id: "c1",
        text: "Recebem ou armazenam leads (nome, telefone, e-mail) em nome do cliente?",
        help: "Formulário, WhatsApp e planilha de lead são todos tratamento de dado.",
      },
      {
        id: "c2",
        text: "Sabem exatamente onde esses dados ficam guardados hoje?",
        help: "Drive pessoal do gestor de tráfego é uma resposta comum — e um risco grande.",
      },
      {
        id: "c3",
        text: "Existe controle de quem na equipe tem acesso a essas bases?",
        help: "Acesso sem controle vira problema quando alguém sai da empresa.",
      },
    ],
  },
  {
    key: "D",
    name: "Páginas / Consentimento",
    color: "var(--aiki-orange)",
    soft: "var(--aiki-orange-soft)",
    items: [
      {
        id: "d1",
        text: "As páginas de captura que publicam têm banner de cookies/consentimento?",
        help: "Quem constrói a página vira corresponsável pelo tratamento nela.",
      },
      {
        id: "d2",
        text: "A política de privacidade reflete o que de fato é feito com o dado?",
        help: "Política genérica copiada da internet não cobre o fluxo real da agência.",
      },
    ],
  },
  {
    key: "E",
    name: "Contratos",
    color: "var(--aiki-orange-deep)",
    soft: "var(--aiki-orange-deep-soft)",
    items: [
      {
        id: "e1",
        text: "Existe contrato definindo quem é controlador e quem é operador dos dados?",
        help: "Sem isso, a divisão de responsabilidade não existe formalmente.",
      },
      {
        id: "e2",
        text: "Está definido quem responde em caso de vazamento por falha da agência?",
        help: "Isso deveria estar no contrato, não ser decidido depois que já vazou.",
      },
    ],
  },
  {
    key: "F",
    name: "Subprocessadores",
    color: "var(--aiki-orange-deep)",
    soft: "var(--aiki-orange-deep-soft)",
    items: [
      {
        id: "f1",
        text: "Conseguem listar todas as ferramentas terceiras que tocam no dado do cliente?",
        help: "CRM, automação, disparo de e-mail, API de WhatsApp — cada uma é um subprocessador.",
      },
      {
        id: "f2",
        text: "Essas ferramentas têm adequação à LGPD conhecida ou documentada?",
        help: "A agência herda o risco de qualquer subprocessador mal documentado.",
      },
    ],
  },
  {
    key: "G",
    name: "Governança interna",
    color: "var(--aiki-green)",
    soft: "var(--aiki-green-soft)",
    items: [
      {
        id: "g1",
        text: "Existe algum treinamento, mesmo informal, sobre uso de dado de cliente?",
        help: "Não precisa ser curso formal — só precisa existir e ser repetido.",
      },
      {
        id: "g2",
        text: "Existe processo de revogar acesso quando alguém sai da equipe?",
        help: "Turnover sem revogação de acesso é uma porta aberta constante.",
      },
    ],
  },
];

const SIGNAL: Category = {
  key: "H",
  name: "Sinal comercial",
  color: "var(--aiki-purple)",
  soft: "var(--aiki-purple-tint)",
  items: [
    {
      id: "h1",
      text: "Algum cliente já pediu comprovação de conformidade LGPD em contrato ou RFP?",
      help: "Não conta pro score de risco — mede se já existe pressão comercial pra resolver isso.",
    },
    {
      id: "h2",
      text: "Já perderam ou quase perderam um contrato por não ter isso?",
      help: "Se sim, o gancho comercial do diagnóstico é imediato.",
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

type HistoryEntry = {
  name: string;
  date: string;
  score: number;
  signal: "Alto" | "Presente" | "Nenhum";
};

const STORE_KEY = "dattis_diag_history_v1";

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

export default function Diagnostico() {
  const [answers, setAnswers] = useState<Record<string, AnswerKey>>({});
  const [agencyName, setAgencyName] = useState("");
  const [agencyDate, setAgencyDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [history, setHistory] = useState<HistoryEntry[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(STORE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(-1); // -1 = intro, 0..TOTAL-1 = questions, RESULTS_STEP = resultado
  const [direction, setDirection] = useState<"fwd" | "back">("fwd");
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    return () => {
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
    };
  }, []);

  const setAnswer = (id: string, key: AnswerKey) =>
    setAnswers((a) => ({ ...a, [id]: key }));

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

    return { catBreakdown, answeredTotal, overallPct, hasAnyRiskAnswer, level, signalCount };
  }, [answers]);

  const summaryText = useMemo(() => {
    const name = agencyName || "[agência]";
    const date = agencyDate || "[data]";
    const sorted = [...computed.catBreakdown]
      .filter((c) => c.answered > 0)
      .sort((a, b) => b.pct - a.pct);
    const top =
      sorted
        .slice(0, 3)
        .map((c) => `${c.name} (${c.pct}%)`)
        .join(", ") || "sem dados suficientes ainda";
    const signalText =
      computed.signalCount === 2
        ? "alto — já pediu prova e quase perdeu contrato"
        : computed.signalCount === 1
        ? "presente — já houve pedido de conformidade"
        : "nenhum gatilho comercial identificado ainda";

    return (
      `Diagnóstico Dattis — ${name}, ${date}\n` +
      `Risco geral: ${
        computed.hasAnyRiskAnswer ? `${computed.level.label} (${computed.overallPct}%)` : "aguardando respostas"
      }\n` +
      `Maiores riscos: ${top}\n` +
      `Sinal comercial: ${signalText}`
    );
  }, [agencyName, agencyDate, computed]);

  const saveToHistory = () => {
    const name = agencyName.trim();
    if (!name) return;
    let totalPoints = 0;
    let totalMax = 0;
    let answeredAny = false;
    CATEGORIES.forEach((cat) => {
      cat.items.forEach((item) => {
        totalMax += 2;
        if (answers[item.id]) {
          totalPoints += pointsFor(answers[item.id]);
          answeredAny = true;
        }
      });
    });
    const score = totalMax > 0 && answeredAny ? Math.round((totalPoints / totalMax) * 100) : 0;
    const entry: HistoryEntry = {
      name,
      date: agencyDate || new Date().toISOString().slice(0, 10),
      score,
      signal: computed.signalCount === 2 ? "Alto" : computed.signalCount === 1 ? "Presente" : "Nenhum",
    };
    const next = [...history, entry];
    setHistory(next);
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(next));
    } catch {
      // ignore quota/availability errors
    }
  };

  const removeFromHistory = (idx: number) => {
    const next = history.filter((_, i) => i !== idx);
    setHistory(next);
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  const resetAll = () => {
    setAnswers({});
    setAgencyName("");
    setAgencyDate(new Date().toISOString().slice(0, 10));
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

  const inQuestion = step >= 0 && step < RESULTS_STEP;
  const inResults = step === RESULTS_STEP;
  const progressPct = step < 0 ? 0 : inResults ? 100 : Math.round((step / TOTAL_QUESTIONS) * 100);
  const current = inQuestion ? ALL_QUESTIONS[step] : null;

  const answered = current ? Boolean(answers[current.item.id]) : false;
  const leftEyebrow = inQuestion && current ? `${current.catKey} · ${current.catName}` : inResults ? "Resultado" : "Diagnóstico Expresso";
  const leftTitle = inResults
    ? computed.hasAnyRiskAnswer
      ? `Risco ${computed.level.label.toLowerCase()}: ${computed.overallPct}% de exposição`
      : "Diagnóstico sem respostas ainda"
    : inQuestion
      ? "Cada resposta mostra onde sua agência está exposta — e onde seu cliente também está."
      : "Descubra quanto a sua agência está exposta à LGPD";

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
            <div className="diag-q" key="intro" data-dir="fwd">
              <p className="diag-panel-label">Checklist de diagnóstico</p>
              <h1 className="diag-intro-title">Sua agência e seus clientes estão protegidos?</h1>
              <p className="diag-intro-sub">
                {TOTAL_QUESTIONS} perguntas sobre como a agência trata dado de lead, uma de cada vez. O score de risco
                atualiza a cada resposta e fica visível até o fim.
              </p>
              <div className="diag-intro-form">
                <div className="diag-field">
                  <label htmlFor="agencyName">Agência</label>
                  <input
                    id="agencyName"
                    type="text"
                    placeholder="Nome da agência"
                    value={agencyName}
                    onChange={(e) => setAgencyName(e.target.value)}
                  />
                </div>
                <div className="diag-field">
                  <label htmlFor="agencyDate">Data</label>
                  <input id="agencyDate" type="date" value={agencyDate} onChange={(e) => setAgencyDate(e.target.value)} />
                </div>
              </div>
            </div>
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
              <p className="diag-panel-label">Diagnóstico completo</p>
              <h1 className="diag-intro-title" style={{ fontSize: "clamp(1.6rem, 3vw, 2.1rem)" }}>
                {agencyName || "Diagnóstico"} — resultado
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
                    Sinal comercial
                  </p>
                  <div className={`diag-signal-badge ${computed.signalCount > 0 ? "on" : "off"}`}>
                    <span>
                      {computed.signalCount === 2
                        ? "Já pediu prova e quase perdeu contrato"
                        : computed.signalCount === 1
                          ? "Já existe pressão comercial por conformidade"
                          : "Nenhum gatilho identificado ainda"}
                    </span>
                    <b>{computed.signalCount > 0 ? (computed.signalCount === 2 ? "Alto" : "Presente") : "—"}</b>
                  </div>
                </div>

                <div>
                  <p className="diag-panel-label">Por categoria</p>
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

              <p className="diag-panel-label" style={{ marginTop: "24px" }}>
                Resumo pra copiar
              </p>
              <textarea className="diag-textarea" readOnly value={mounted ? summaryText : ""} />
              <div className="diag-btn-row" style={{ marginTop: "10px" }}>
                <button className="diag-btn primary" onClick={saveToHistory}>
                  Salvar no histórico
                </button>
                <button className="diag-btn" onClick={() => goTo(TOTAL_QUESTIONS - 1, "back")}>
                  Revisar respostas
                </button>
                <button className="diag-btn" onClick={resetAll}>
                  Novo diagnóstico
                </button>
              </div>

              <div className="diag-cta">
                <h3>Você e seu cliente estão expostos. Corrija isso antes da multa.</h3>
                <p>
                  A Dattis gera o registro do que vocês fazem com o dado de cada cliente, o contrato entre vocês, o
                  certificado pro rodapé do site e o dossiê pra contestar BM suspensa.
                </p>
                <div className="diag-cta-row">
                  <a className="diag-cta-btn" href="/planos">
                    Ver planos →
                  </a>
                  <a className="diag-cta-btn ghost" href="/auditoria">
                    Auditar um site →
                  </a>
                </div>
              </div>

              <section className="diag-history">
                <h2>Histórico local</h2>
                <p className="hint">Salvo apenas neste navegador — não sincroniza entre dispositivos.</p>
                <div className="diag-table-wrap">
                  <table className="diag-table">
                    <thead>
                      <tr>
                        <th>Agência</th>
                        <th>Data</th>
                        <th>Score</th>
                        <th>Nível</th>
                        <th>Sinal comercial</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {!mounted || history.length === 0 ? (
                        <tr className="diag-empty-row">
                          <td colSpan={6}>Nenhum diagnóstico salvo ainda.</td>
                        </tr>
                      ) : (
                        [...history]
                          .map((entry, realIdx) => ({ entry, realIdx }))
                          .reverse()
                          .map(({ entry, realIdx }) => {
                            const lvl = levelFor(entry.score);
                            return (
                              <tr key={realIdx}>
                                <td>{entry.name}</td>
                                <td>{entry.date}</td>
                                <td className="num">{entry.score}%</td>
                                <td>
                                  <span className="diag-level-pill" style={{ background: lvl.soft, color: lvl.color }}>
                                    {lvl.label}
                                  </span>
                                </td>
                                <td>{entry.signal}</td>
                                <td>
                                  <button className="diag-remove-btn" onClick={() => removeFromHistory(realIdx)}>
                                    Remover
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              <footer className="diag-foot">Dattis — ferramenta de diagnóstico, não substitui parecer jurídico.</footer>
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
              onClick={() => goTo(step + 1, "fwd")}
              disabled={inQuestion && !answered}
              className="btn btn-dark btn-lg disabled:opacity-30"
            >
              {step === -1 ? "Começar" : step === TOTAL_QUESTIONS - 1 ? "Ver resultado" : "Continuar"} <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
