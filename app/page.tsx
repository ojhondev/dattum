"use client";

import { useState } from "react";
import Image from "next/image";

type ModuleKey = "rat" | "dpa" | "subprocessadores" | "auditoria";

const MODULES: { key: ModuleKey; label: string }[] = [
  { key: "rat", label: "rat" },
  { key: "dpa", label: "dpa" },
  { key: "subprocessadores", label: "subprocessadores" },
  { key: "auditoria", label: "auditoria" },
];

const MODULE_TITLES: Record<ModuleKey, string> = {
  rat: "painel.dattis.com/contas/loja-aurora — o que fazemos com o dado",
  dpa: "painel.dattis.com/contas/loja-aurora — contrato com o cliente",
  subprocessadores: "painel.dattis.com/subprocessadores — quem mais mexe nesse dado",
  auditoria: "dattis.com/auditoria — resultado",
};

function RatPreview() {
  return (
    <div className="mw-rat-card">
      <h4>Conversion API (CAPI) e Custom Audiences</h4>
      <div className="mw-rat-grid">
        <div className="full">
          <p className="mw-field-label">Categorias de dado</p>
          <p className="mw-field-value">
            Dado de contato hasheado (e-mail, telefone), identificador de dispositivo, evento de conversão
          </p>
        </div>
        <div>
          <p className="mw-field-label">Finalidade</p>
          <p className="mw-field-value">Otimizar e mensurar campanhas de tráfego pago via Meta Ads em nome do cliente</p>
        </div>
        <div>
          <p className="mw-field-label">Base legal</p>
          <p className="mw-field-value">Legítimo interesse do controlador e execução do contrato (art. 7º, IX e V, LGPD)</p>
        </div>
        <div>
          <p className="mw-field-label">Titulares</p>
          <p className="mw-field-value">Leads e clientes do cliente final atendido pela agência</p>
        </div>
        <div>
          <p className="mw-field-label">Prazo de retenção</p>
          <p className="mw-field-value">Enquanto durar a campanha ativa, mais 6 meses</p>
        </div>
      </div>
    </div>
  );
}

function DpaPreview() {
  return (
    <div>
      <span className="mw-dpa-badge">Assinado eletronicamente</span>
      <div className="mw-dpa-doc">
{`CONTRATO DE OPERAÇÃO DE DADOS PESSOAIS (DPA)

Firmado nos termos da Lei nº 13.709/2018 (LGPD), entre:
OPERADORA: Agência Aurora Tráfego.
CONTROLADORA: Loja Aurora.

1. OBJETO
A Agência tratará dados pessoais em nome do Cliente exclusivamente
para a execução dos serviços de tráfego pago contratados...

3. SUBPROCESSADORES AUTORIZADOS
  - Meta Ads (Facebook/Instagram)
  - WhatsApp Business API`}
      </div>
    </div>
  );
}

function SubprocessadoresPreview() {
  const rows = [
    { nome: "Meta Ads (Facebook/Instagram)", categoria: "Publicidade", contas: 1 },
    { nome: "Google Ads / Google Analytics", categoria: "Publicidade", contas: 1 },
    { nome: "WhatsApp Business API", categoria: "Atendimento", contas: 1 },
    { nome: "RD Station", categoria: "CRM/Automação", contas: 1 },
  ];
  return (
    <table className="mw-table">
      <thead>
        <tr>
          <th>Ferramenta</th>
          <th>Categoria</th>
          <th>Em quantas contas</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.nome}>
            <td>{r.nome}</td>
            <td>{r.categoria}</td>
            <td>{r.contas}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function AuditoriaPreview() {
  const findings = [
    { label: "Meta Pixel / CAPI", detail: "Confirmado por requisição de rede real", bad: true },
    { label: "Banner de consentimento de cookies", detail: "Não encontrado no DOM renderizado", bad: true },
    { label: "HTTPS", detail: "Certificado válido", bad: false },
    { label: "Política de privacidade", detail: "Link encontrado no rodapé", bad: false },
  ];
  return (
    <div>
      <div className="mw-audit-head">
        <div className="mw-gauge">
          <div className="mw-gauge-inner">
            <span className="mw-gauge-pct">38%</span>
            <span className="mw-gauge-level">Médio</span>
          </div>
        </div>
        <div>
          <p style={{ fontWeight: 600, color: "var(--ink)", fontSize: ".98rem", marginBottom: 4 }}>
            Risco Médio — dá pra corrigir rápido, antes que vire problema
          </p>
          <p style={{ fontSize: ".8rem", color: "var(--carbon-60)", fontFamily: "var(--font-mono-fam)" }}>
            lojaaurora.com.br
          </p>
        </div>
      </div>
      {findings.map((f) => (
        <div className="mw-finding" key={f.label}>
          <span className={`mw-finding-icon ${f.bad ? "bad" : "ok"}`}>{f.bad ? "!" : "✓"}</span>
          <div>
            <div className="mw-finding-label">{f.label}</div>
            <div className="mw-finding-detail">{f.detail}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeModule, setActiveModule] = useState<ModuleKey>("rat");

  return (
    <div className="home-page">
      <div className="home-nav-wrap">
        <nav className="home-nav">
          <a href="#top" className="home-nav-brand">
            <Image src="/brand/logo-fundo-dark.png" alt="Dattis" width={110} height={21} style={{ height: 21, width: "auto" }} priority />
          </a>
          <div className="home-nav-links">
            <a href="#modulos">Módulos</a>
            <a href="/diagnostico">Diagnóstico</a>
            <a href="/auditoria">Auditoria</a>
            <a href="#precos">Preços</a>
          </div>
          <div className="home-nav-actions">
            <a href="/entrar" className="home-login">
              Entrar
            </a>
            <a href="/cadastro" className="home-btn home-btn-mint">
              Começar grátis
            </a>
            <button className="home-menu-btn" onClick={() => setMobileOpen(true)} aria-label="Abrir menu">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>
        </nav>
      </div>

      <div className={`home-mobile-menu ${mobileOpen ? "open" : ""}`}>
        <div className="mm-top">
          <Image src="/brand/logo-fundo-dark.png" alt="Dattis" width={100} height={19} style={{ height: 19, width: "auto" }} />
          <button className="mm-close" onClick={() => setMobileOpen(false)} aria-label="Fechar menu">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="5" y1="5" x2="19" y2="19" />
              <line x1="19" y1="5" x2="5" y2="19" />
            </svg>
          </button>
        </div>
        <nav>
          <a href="#modulos" onClick={() => setMobileOpen(false)}>Módulos</a>
          <a href="/diagnostico" onClick={() => setMobileOpen(false)}>Diagnóstico</a>
          <a href="/auditoria" onClick={() => setMobileOpen(false)}>Auditoria</a>
          <a href="#precos" onClick={() => setMobileOpen(false)}>Preços</a>
        </nav>
        <div className="mm-cta">
          <a href="/entrar" className="home-btn home-btn-outline-white">Entrar</a>
          <a href="/cadastro" className="home-btn home-btn-mint">Começar grátis</a>
        </div>
      </div>

      <main id="top">
        {/* ============ 1ª DOBRA — hero ============ */}
        <section className="home-hero">
          <div className="wrap">
            <span className="eyebrow" style={{ marginBottom: 18 }}>
              Dattis · Compliance LGPD para agências de tráfego pago
            </span>
            <h1>
              Agência: evite multas por falta de conformidade com a LGPD
            </h1>
            <p className="hero-sub">
              A Dattis gera, para cada cliente que sua agência atende, o registro do que vocês
              fazem com o dado dele, o contrato assinado entre vocês e a lista de ferramentas
              que também tocam esse dado — sem precisar contratar um advogado por documento.
            </p>
            <div className="home-hero-ctas">
              <a href="/cadastro" className="home-btn home-btn-ink">
                Começar grátis →
              </a>
              <a href="/diagnostico" className="home-btn home-btn-outline">
                Fazer o Diagnóstico Expresso
              </a>
            </div>
            <p className="home-trust-line">Baseado na Lei 13.709/2018 (LGPD) · feito para agências de tráfego pago</p>
          </div>
        </section>

        {/* ============ 2ª DOBRA — módulos ============ */}
        <section className="home-modules" id="modulos">
          <div className="wrap">
            <div className="home-modules-head">
              <span className="eyebrow">Dentro da plataforma</span>
              <h2>Uma plataforma, todos os documentos que sua agência precisa</h2>
              <p>Cada módulo abaixo já está em funcionamento — clique pra ver o que ele gera.</p>
            </div>

            <div className="module-tabs" role="tablist">
              {MODULES.map((m) => (
                <button
                  key={m.key}
                  role="tab"
                  aria-selected={activeModule === m.key}
                  className="module-tab"
                  onClick={() => setActiveModule(m.key)}
                >
                  <span className="mt-slash">dattis/</span>
                  {m.label}
                </button>
              ))}
            </div>

            <div className="module-stage">
              <div className="module-window">
                <div className="module-window-bar">
                  <span className="module-window-dot" />
                  <span className="module-window-dot" />
                  <span className="module-window-dot" />
                  <span className="module-window-title">{MODULE_TITLES[activeModule]}</span>
                </div>
                <div className="module-window-body">
                  {activeModule === "rat" && <RatPreview />}
                  {activeModule === "dpa" && <DpaPreview />}
                  {activeModule === "subprocessadores" && <SubprocessadoresPreview />}
                  {activeModule === "auditoria" && <AuditoriaPreview />}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="home-footer">
        <div className="wrap">
          <Image src="/brand/logo-fundo-dark.png" alt="Dattis" width={90} height={17} style={{ height: 17, width: "auto" }} />
          <div className="home-footer-links">
            <a href="/diagnostico">Diagnóstico</a>
            <a href="/auditoria">Auditoria</a>
            <a href="/entrar">Entrar</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
