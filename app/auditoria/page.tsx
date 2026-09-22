"use client";

import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from "react";
import "./auditoria.css";

type FindingKind = "tracker" | "capture" | "consent" | "policy" | "security";

type Finding = {
  id: string;
  label: string;
  kind: FindingKind;
  triggered: boolean;
  weight: number;
  detail: string;
  article?: string;
  fix: string[];
};

type Risk = { title: string; detail: string };
type LevelTone = "green" | "orange" | "orange-deep" | "red";
type Level = { label: string; tone: LevelTone };

type AuditOk = {
  ok: true;
  url: string;
  https: boolean;
  findings: Finding[];
  score: number;
  level: Level;
  risks: Risk[];
};
type AuditErr = { ok: false; error: string };
type AuditResult = AuditOk | AuditErr;

const SCAN_STEPS = [
  "Abrindo o site num navegador real...",
  "Monitorando requisições de rede (Meta, Google, TikTok)...",
  "Lendo cookies definidos durante o carregamento...",
  "Verificando formulários e captura de dado...",
  "Checando banner de consentimento de cookies...",
  "Calculando o score de risco...",
];

const TONE_COLOR: Record<LevelTone, string> = {
  green: "var(--aiki-green)",
  orange: "var(--aiki-orange)",
  "orange-deep": "var(--aiki-orange-deep)",
  red: "var(--aiki-red)",
};

function OkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 12 9 18 20 6" />
    </svg>
  );
}

function BadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="6" y1="18" x2="18" y2="6" />
    </svg>
  );
}

function headlineFor(level: Level, triggeredCount: number) {
  if (level.label === "Crítico") return `Risco Crítico — ${triggeredCount} pontos de exposição encontrados`;
  if (level.label === "Alto") return `Risco Alto — o site tem ${triggeredCount} pontos que pedem atenção`;
  if (level.label === "Médio") return "Risco Médio — dá pra corrigir rápido, antes que vire problema";
  return "Risco Baixo neste teste — mas isso não é uma auditoria completa";
}

export default function Auditoria() {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<"idle" | "scanning" | "done" | "error">("idle");
  const [scanMsgIdx, setScanMsgIdx] = useState(0);
  const [result, setResult] = useState<AuditOk | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const scanTimer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  useEffect(() => {
    return () => {
      if (scanTimer.current) clearInterval(scanTimer.current);
    };
  }, []);

  const runAudit = async (e: FormEvent) => {
    e.preventDefault();
    if (!url.trim() || status === "scanning") return;

    setStatus("scanning");
    setScanMsgIdx(0);
    setErrorMsg("");

    const startedAt = Date.now();
    scanTimer.current = setInterval(() => {
      setScanMsgIdx((i) => Math.min(i + 1, SCAN_STEPS.length - 1));
    }, 650);

    let data: AuditResult;
    try {
      const res = await fetch("/api/auditoria", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      data = await res.json();
    } catch {
      data = { ok: false, error: "Não foi possível completar a análise agora. Tenta de novo em alguns segundos." };
    }

    const elapsed = Date.now() - startedAt;
    const wait = Math.max(0, 2200 - elapsed);
    await new Promise((r) => setTimeout(r, wait));
    if (scanTimer.current) clearInterval(scanTimer.current);

    if (data.ok) {
      setResult(data);
      setStatus("done");
    } else {
      setErrorMsg(data.error);
      setStatus("error");
    }
  };

  const reset = () => {
    setStatus("idle");
    setResult(null);
    setErrorMsg("");
  };

  const gaugeStyle = result
    ? ({ "--gauge-pct": result.score, "--gauge-color": TONE_COLOR[result.level.tone] } as CSSProperties)
    : undefined;

  const triggeredFindings = result?.findings.filter((f) => f.triggered) ?? [];
  const okFindings = result?.findings.filter((f) => !f.triggered) ?? [];

  return (
    <div className="audit-page">
      <div className="audit-wrap">
        <div className="audit-eyebrow">Dattis · Auditoria de Risco</div>

        {status === "idle" && (
          <>
            <h1 className="audit-title">Seu site pode estar expondo dado de visitante agora mesmo.</h1>
            <p className="audit-sub">
              Cole o link do site — a gente varre o código-fonte em busca de pixel de
              rastreamento sem consentimento, formulário capturando dado sem base
              legal, política de privacidade ausente e mais. Leva menos de 10 segundos.
            </p>
            <form className="audit-form" onSubmit={runAudit}>
              <input
                className="audit-input"
                type="text"
                inputMode="url"
                placeholder="seusite.com.br"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                aria-label="URL do site pra auditar"
              />
              <button className="audit-submit" type="submit" disabled={!url.trim()}>
                Auditar site →
              </button>
            </form>
            <p className="audit-hint">
              Analisamos só o código público da página — não é uma auditoria jurídica completa.
            </p>
          </>
        )}

        {status === "scanning" && (
          <div className="audit-scan">
            <div className="audit-scan-ring" role="status" aria-live="polite"></div>
            <div>
              <div className="audit-scan-status">{SCAN_STEPS[scanMsgIdx]}</div>
              <div className="audit-scan-target">{url}</div>
            </div>
          </div>
        )}

        {status === "error" && (
          <>
            <h1 className="audit-title">Seu site pode estar expondo dado de visitante agora mesmo.</h1>
            <p className="audit-sub">
              Cole o link do site — a gente varre o código-fonte em busca de pixel de
              rastreamento sem consentimento, formulário capturando dado sem base
              legal, política de privacidade ausente e mais. Leva menos de 10 segundos.
            </p>
            <form className="audit-form" onSubmit={runAudit}>
              <input
                className="audit-input"
                type="text"
                inputMode="url"
                placeholder="seusite.com.br"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                aria-label="URL do site pra auditar"
              />
              <button className="audit-submit" type="submit" disabled={!url.trim()}>
                Tentar de novo →
              </button>
            </form>
            <div className="audit-error">{errorMsg}</div>
          </>
        )}

        {status === "done" && result && (
          <div>
            <div className="audit-result-head">
              <div className="audit-gauge" style={gaugeStyle}>
                <div className="audit-gauge-inner">
                  <div className="audit-gauge-pct">{result.score}%</div>
                  <div className="audit-gauge-level" style={{ color: TONE_COLOR[result.level.tone] }}>
                    {result.level.label}
                  </div>
                </div>
              </div>
              <div>
                <h1 className="audit-result-headline">{headlineFor(result.level, triggeredFindings.length)}</h1>
                <div className="audit-result-target">{result.url}</div>
              </div>
            </div>

            <p className="audit-section-label">Riscos identificados</p>
            {result.risks.map((r, i) => (
              <div className={`audit-risk-card ${result.risks.length === 1 && triggeredFindings.length === 0 ? "calm" : ""}`} key={i}>
                <h3>{r.title}</h3>
                <p>{r.detail}</p>
              </div>
            ))}

            <p className="audit-section-label" style={{ marginTop: "32px" }}>
              O que a varredura encontrou ({triggeredFindings.length} de {result.findings.length} pontos de atenção)
            </p>
            <div className="audit-findings">
              {[...triggeredFindings, ...okFindings].map((f) => (
                <div className="audit-finding" key={f.id}>
                  <span className={`audit-finding-icon ${f.triggered ? "bad" : "ok"}`}>
                    {f.triggered ? <BadIcon /> : <OkIcon />}
                  </span>
                  <div className="audit-finding-body">
                    <div className="audit-finding-top">
                      <span className="audit-finding-label">{f.label}</span>
                      {f.article && <span className="audit-finding-article">{f.article}</span>}
                    </div>
                    <p className="audit-finding-detail">{f.detail}</p>
                    {f.triggered && f.fix.length > 0 && (
                      <div className="audit-finding-fix">
                        <p className="audit-finding-fix-label">Como corrigir</p>
                        <ol>
                          {f.fix.map((step, i) => (
                            <li key={i}>{step}</li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <p className="audit-disclaimer">
              Essa é uma varredura automática com navegador real (não só leitura de
              HTML estático) — mas ainda assim não substitui parecer jurídico e não vê
              o que acontece no backend, em cookies definidos após uma interação do
              usuário, nem em contratos e retenção real de dado. Fundamentado na LGPD
              (Lei 13.709/2018); nunca apresentado como comunicação oficial da ANPD.
            </p>

            <div className="audit-cta">
              <h3>Quer o diagnóstico completo da sua operação, não só do site?</h3>
              <p>
                O site é só a porta de entrada. O Diagnóstico Expresso cobre Custom
                Audiences, CAPI, CRM, contratos e subprocessadores — os pontos que uma
                varredura de página não alcança.
              </p>
              <div className="audit-cta-row">
                <a className="audit-cta-btn" href="/diagnostico">
                  Fazer o Diagnóstico Expresso →
                </a>
              </div>
            </div>

            <button className="audit-again" onClick={reset}>
              ← Auditar outro site
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
