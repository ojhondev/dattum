"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
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

  return (
    <div className="diag-page">
      {step >= 0 && (
        <div className="diag-progressbar">
          <div className="diag-progressbar-fill" style={{ width: `${progressPct}%` }}></div>
        </div>
      )}

      <div className="diag-header-fixed">
        <div className="diag-header-eyebrow">Dattis · Diagnóstico Expresso</div>
        {step >= 0 && (
          <div className="diag-score-chip">
            <span className="diag-score-ring" style={scoreChipStyle}>
              <span className="diag-score-ring-inner">{computed.hasAnyRiskAnswer ? computed.overallPct : "—"}</span>
            </span>
            <span className="diag-score-chip-text">
              <b style={{ color: computed.hasAnyRiskAnswer ? computed.level.color : "var(--aiki-carbon-60)" }}>
                {computed.hasAnyRiskAnswer ? computed.level.label : "aguardando"}
              </b>
              <span>{computed.answeredTotal}/{TOTAL_QUESTIONS} respondidas</span>
            </span>
          </div>
        )}
      </div>

      {step === -1 && (
        <div className="diag-stage intro">
          <div className="diag-q" key="intro">
            <h1 className="diag-intro-title">Checklist de Diagnóstico</h1>
            <p className="diag-intro-sub">
              Pra rodar ao vivo em ~15–20 min com uma agência de tráfego pago. Uma
              pergunta de cada vez — responda conforme a conversa avança, o score de
              risco atualiza sozinho e fica visível até o fim.
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
                <input
                  id="agencyDate"
                  type="date"
                  value={agencyDate}
                  onChange={(e) => setAgencyDate(e.target.value)}
                />
              </div>
            </div>
            <button className="diag-btn primary diag-intro-btn" onClick={() => goTo(0, "fwd")}>
              Começar diagnóstico →
            </button>
          </div>
        </div>
      )}

      {inQuestion && current && (
        <div className="diag-stage">
          <div className="diag-q" key={step} data-dir={direction}>
            <button className="diag-back" onClick={() => goTo(step - 1, "back")}>
              ← Voltar
            </button>
            <div className="diag-q-eyebrow" style={{ color: current.color }}>
              {current.catKey} · {current.catName}
            </div>
            <p className="diag-q-count">
              Pergunta {step + 1} de {TOTAL_QUESTIONS}
            </p>
            <h2 className="diag-q-text">{current.item.text}</h2>
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
        </div>
      )}

      {inResults && (
        <div className="diag-stage results">
          <div className="diag-q" key="results">
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
                ← Revisar respostas
              </button>
              <button className="diag-btn" onClick={resetAll}>
                Novo diagnóstico
              </button>
            </div>

            <div className="diag-cta">
              <h3>Corrija isso de verdade, não só descubra o problema</h3>
              <p>
                Crie sua conta grátis — a Dattis já gera o registro do que vocês fazem com
                o dado de cada cliente e o contrato entre vocês, prontos pra assinar.
              </p>
              <div className="diag-cta-row">
                <a className="diag-cta-btn" href="/cadastro">
                  Criar conta grátis →
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

            <footer className="diag-foot">Dattis — ferramenta interna de diagnóstico, não substitui parecer jurídico.</footer>
          </div>
        </div>
      )}
    </div>
  );
}
