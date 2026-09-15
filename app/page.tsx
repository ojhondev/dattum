"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const PICKS: { key: string; label: string; short: string }[] = [
  {
    key: "contrato",
    label: "Contrato de prestação de serviço genérico, sem cláusula de dados",
    short: "contrato de operador",
  },
  {
    key: "contaminacao",
    label: "Contaminação cruzada de base entre clientes",
    short: "segregação de base",
  },
  {
    key: "exclusao",
    label: "Pedido de exclusão que ninguém sabe processar",
    short: "canal do titular",
  },
  {
    key: "selo",
    label: "Selo de conformidade pra vender",
    short: "selo de conformidade",
  },
  {
    key: "incidente",
    label: "Zero playbook de incidente",
    short: "plano de incidente",
  },
];

function Check() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
      <polyline points="4 12 9 18 20 6" />
    </svg>
  );
}

function DocIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 3h7l5 5v13H7z" />
      <path d="M14 3v5h5" />
      <path d="M9.5 13h5M9.5 16.5h5" />
    </svg>
  );
}

function InboxIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12h5l2 3h4l2-3h5" />
      <path d="M5 12 4 5h16l-1 7" />
      <path d="M4 12v6a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-6" />
    </svg>
  );
}

function NetworkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="6" r="2.4" />
      <circle cx="18" cy="6" r="2.4" />
      <circle cx="12" cy="18" r="2.4" />
      <path d="M8 7.3 14.7 17M16 7.3 9.3 17M8.4 6h7.2" />
    </svg>
  );
}

function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) {
      el.classList.add("in");
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            (e.target as HTMLElement).classList.add("in");
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

export default function Home() {
  const [showUtilBar, setShowUtilBar] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [barsFilled, setBarsFilled] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setBarsFilled(true), 50);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
  }, [menuOpen]);

  const togglePick = (key: string) =>
    setSelected((s) => ({ ...s, [key]: !s[key] }));

  const activeLabels = PICKS.filter((p) => selected[p.key]).map((p) => p.short);
  const hint =
    activeLabels.length > 0
      ? `Seu diagnóstico vai priorizar: ${activeLabels.join(", ")}.`
      : " ";

  const revServ = useReveal<HTMLElement>();
  const revJourney = useReveal<HTMLElement>();
  const revDiff1 = useReveal<HTMLDivElement>();
  const revDiff2 = useReveal<HTMLDivElement>();
  const revMarcas = useReveal<HTMLDivElement>();

  return (
    <>
      {showUtilBar && (
        <div className="util-bar" id="utilbar">
          <div className="wrap">
            <div className="util-left">
              <span className="wa-dot"></span>
              <span>Fale com nosso time:</span>
              <span className="util-phone">+55 55006 6778</span>
            </div>
            <button
              className="util-close"
              aria-label="Fechar aviso"
              onClick={() => setShowUtilBar(false)}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <header className="site">
        <div className="wrap">
          <a className="wordmark" href="#top">
            <Image src="/logo-dattum.png" alt="Dattum" width={640} height={146} className="logo-img" priority />
          </a>
          <div className="header-mid">
            <nav className="navlinks">
              <a href="#solucoes">soluções</a>
              <a href="#exemplo">casos de uso</a>
              <a href="#quem-atendemos">quem atendemos</a>
              <a href="#precos">preços</a>
            </nav>
          </div>
          <div className="header-actions">
            <a className="btn btn-ghost" href="#cta">
              entrar
            </a>
            <a className="btn btn-dark" href="#cta">
              veja uma demo
            </a>
            <button
              className="menu-btn"
              aria-label="Abrir menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(true)}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <div className={`mobile-menu${menuOpen ? " open" : ""}`}>
        <div className="mm-top">
          <a className="wordmark" href="#top">
            <Image src="/logo-dattum.png" alt="Dattum" width={640} height={146} className="logo-img" />
          </a>
          <button
            className="menu-btn"
            aria-label="Fechar menu"
            style={{ display: "flex" }}
            onClick={() => setMenuOpen(false)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="6" y1="18" x2="18" y2="6" />
            </svg>
          </button>
        </div>
        <nav>
          <a href="#solucoes" onClick={() => setMenuOpen(false)}>
            soluções
          </a>
          <a href="#exemplo" onClick={() => setMenuOpen(false)}>
            casos de uso
          </a>
          <a href="#quem-atendemos" onClick={() => setMenuOpen(false)}>
            quem atendemos
          </a>
          <a href="#precos" onClick={() => setMenuOpen(false)}>
            preços
          </a>
        </nav>
        <div className="mm-cta">
          <a className="btn btn-ghost btn-block" href="#cta" onClick={() => setMenuOpen(false)}>
            entrar
          </a>
          <a className="btn btn-dark btn-block" href="#cta" onClick={() => setMenuOpen(false)}>
            veja uma demo
          </a>
        </div>
      </div>

      <div className="hero" id="top">
        <div className="hero-copy">
          <h1>Sua agência pode ser multada por falta de conformidade com a LGPD</h1>
          <p className="hero-sub">Marque o que já é problema pra você:</p>
          <div className="pick-grid" role="group" aria-label="Selecione seus desafios de conformidade">
            <div className="pick-row">
              {PICKS.slice(0, 2).map((p) => (
                <button
                  key={p.key}
                  type="button"
                  className="pick"
                  aria-pressed={!!selected[p.key]}
                  onClick={() => togglePick(p.key)}
                >
                  <span className="pick-box">
                    <Check />
                  </span>
                  <span className="pick-label">{p.label}</span>
                </button>
              ))}
            </div>
            <div className="pick-row">
              {PICKS.slice(2).map((p) => (
                <button
                  key={p.key}
                  type="button"
                  className="pick"
                  aria-pressed={!!selected[p.key]}
                  onClick={() => togglePick(p.key)}
                >
                  <span className="pick-box">
                    <Check />
                  </span>
                  <span className="pick-label">{p.label}</span>
                </button>
              ))}
            </div>
          </div>
          <p className="pick-hint" aria-live="polite">
            {hint}
          </p>
          <a className="btn btn-white btn-block" href="#cta">
            Agendar uma análise de especialista
          </a>
          <p className="hero-trust">
            Fundamentado na LGPD (Lei 13.709/2018, art. 42 e 52). Nunca
            apresentado como comunicação oficial da ANPD.
          </p>
        </div>
        <div className="hero-visual">
          <span className="photo-note">Imagem — placeholder</span>
        </div>
      </div>

      <section className="block reveal" id="solucoes" ref={revServ}>
        <div className="wrap">
          <div className="block-head solo">
            <h2>A plataforma da LGPD para agências de tráfego e performance</h2>
          </div>
          <div className="svc-grid">
            <div className="svc-card">
              <span className="svc-icon violet">
                <DocIcon />
              </span>
              <h4>Contrato de operador padronizado</h4>
              <p>
                Template gerado e enviado pra cada cliente da carteira
                assinar — sem trabalho jurídico caso a caso.
              </p>
              <div className="progress-pill">
                <div className="pp-label">4 de 7 contas assinadas</div>
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{ width: barsFilled ? "57%" : "0%" }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="svc-card">
              <span className="svc-icon celadon">
                <InboxIcon />
              </span>
              <h4>Canal do titular centralizado</h4>
              <p>
                Formulário único, roteando pedido de exclusão ou acesso pro
                cliente certo, com prazo rastreado.
              </p>
              <div className="progress-pill">
                <div className="pp-label-row">
                  <span className="pp-label">Configurado e ativo</span>
                  <span className="pp-check">
                    <Check />
                  </span>
                </div>
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{ width: barsFilled ? "100%" : "0%" }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="svc-card">
              <span className="svc-icon amber">
                <NetworkIcon />
              </span>
              <h4>Mapeamento de sub-processadores</h4>
              <p>
                Todo SaaS que toca o dado de cada conta — Meta, RD Station,
                WhatsApp API — listado e monitorado.
              </p>
              <div className="progress-pill">
                <div className="pp-label">12 de 15 ferramentas mapeadas</div>
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{ width: barsFilled ? "80%" : "0%" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="block reveal" ref={revJourney}>
        <div className="wrap">
          <div className="block-head center">
            <span className="eyebrow">O QUE A DATTUM FAZ</span>
            <h2>Como a Dattum atua</h2>
          </div>
          <div className="tag-row">
            <span className="jtag jtag-1">Risco LGPD</span>
            <span className="jtag jtag-2">Sprint de higienização</span>
            <span className="jtag jtag-3">Obrigações acessórias</span>
          </div>
          <div className="timeline-rule"></div>
          <div className="journey-grid">
            <div className="j-col">
              <h4>Como está hoje</h4>
              <div className="j-card">
                Contrato de prestação de serviço genérico, CRM compartilhado
                entre clientes, e ninguém sabe quem responde se um lead
                reclamar — a agência já é operadora de dados e já responde
                solidariamente por isso (art. 42), mesmo sem saber.
              </div>
            </div>
            <div className="j-col">
              <h4>O problema</h4>
              <div className="j-card">
                Sem contrato de operador, sem canal do titular, sem plano de
                incidente — cada cliente novo é um novo ponto de exposição,
                e a responsabilidade pode se equiparar à do controlador.
              </div>
            </div>
            <div className="j-col">
              <h4>Com a Dattum</h4>
              <div className="j-card">
                Diagnóstico gratuito, sprint de higienização em 10 dias
                úteis, e a carteira inteira operando sob as onze obrigações
                acessórias da Dattum — cliente novo e cliente antigo, sem
                depender de projeto avulso.
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="dark-band reveal" ref={revDiff1}>
        <div className="wrap">
          <div className="diff-head">
            <h2>Diferenciais da Dattum baseados nas dores das agências</h2>
          </div>
          <div className="diff-cards">
            <div className="diff-card">
              <h5>Relatório mensal por conta</h5>
              <p>
                Score de conformidade e pendências, conta por conta e
                agregado — igual ao fechamento que o contador manda todo
                mês.
              </p>
              <span className="dc-more">saiba mais →</span>
            </div>
            <div className="diff-card">
              <h5>Motor de diagnóstico contínuo</h5>
              <p>
                Reexecuta sobre as campanhas ativas — pega o pixel novo, o
                app novo, o contrato que falta, sem esperar reclamação.
              </p>
              <span className="dc-more">saiba mais →</span>
            </div>
            <div className="diff-card">
              <h5>Playbook multicliente de incidente</h5>
              <p>
                Um plano só, cobrindo toda a carteira — mostra o raio de
                impacto entre clientes no minuto em que algo vaza.
              </p>
              <span className="dc-more">saiba mais →</span>
            </div>
          </div>
          <div className="diff-photo">
            <span className="ph-note">Imagem — placeholder</span>
            <div className="tool-list-card">
              <div className="tl-row">
                <span className="tl-name">
                  <span className="tl-dot">M</span>Meta Ads
                </span>
                <span className="tl-check">✓</span>
              </div>
              <div className="tl-row">
                <span className="tl-name">
                  <span className="tl-dot">R</span>RD Station
                </span>
                <span className="tl-check">✓</span>
              </div>
              <div className="tl-row">
                <span className="tl-name">
                  <span className="tl-dot">W</span>WhatsApp API
                </span>
                <span className="tl-check">✓</span>
              </div>
              <div className="tl-row">
                <span className="tl-name">
                  <span className="tl-dot">Z</span>Zapier
                </span>
                <span className="tl-check">✓</span>
              </div>
              <div className="tl-row">
                <span className="tl-name">
                  <span className="tl-dot">H</span>Hotmart
                </span>
                <span className="tl-check">✓</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className="dark-band reveal"
        style={{ paddingTop: 0 }}
        ref={revDiff2}
      >
        <div className="wrap">
          <div className="infra-panel">
            <h3>
              Construindo infraestrutura própria de gestão LGPD para
              agências.
            </h3>
            <div className="badge-cloud">
              <span className="tool-badge">
                <span className="tb-dot"></span>Meta Ads
              </span>
              <span className="tool-badge">
                <span className="tb-dot"></span>Google Ads
              </span>
              <span className="tool-badge">
                <span className="tb-dot"></span>TikTok Ads
              </span>
              <span className="tool-badge">
                <span className="tb-dot"></span>RD Station
              </span>
              <span className="tool-badge">
                <span className="tb-dot"></span>WhatsApp API
              </span>
              <span className="tool-badge">
                <span className="tb-dot"></span>Zapier
              </span>
              <span className="tool-badge">
                <span className="tb-dot"></span>Hotmart
              </span>
              <span className="tool-badge">
                <span className="tb-dot"></span>ActiveCampaign
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="marcas reveal" id="quem-atendemos" ref={revMarcas}>
        <div className="wrap">
          <p className="mc-head">
            <strong>A Dattum ainda não tem 500 agências como cliente</strong>{" "}
            — tem uma tese jurídica que não depende de escala pra ser
            verdadeira. Auditamos agências que operam em:
          </p>
          <div className="tool-row">
            <span>Meta Ads</span>
            <span>Google Ads</span>
            <span>TikTok Ads</span>
            <span>RD Station</span>
            <span>WhatsApp API</span>
            <span>Hotmart</span>
          </div>
        </div>
      </div>

      <div className="reviews-panel" id="exemplo">
        <div className="wrap">
          <span className="ex-tag">
            Exemplo ilustrativo — não é uma cliente real
          </span>
          <div className="block-head">
            <h2>É assim que um diagnóstico de operador chega até você</h2>
            <p>
              A &quot;Agência Exemplo&quot; abaixo é fictícia — construída
              pra mostrar a estrutura real de um relatório: fato
              verificável, artigo da lei, risco. A Dattum ainda não tem
              clientes publicados; por isso não há depoimentos nesta página
              — só o que conseguimos provar.
            </p>
          </div>
          <div className="ex-cards">
            <div className="finding-card">
              <div className="fc-head">
                <h5>Base de leads compartilhada</h5>
                <code>art. 42</code>
              </div>
              <p>
                O mesmo CRM concentra leads de 3 clientes diferentes, sem
                segregação — risco de equiparação da agência ao controlador.
              </p>
            </div>
            <div className="finding-card">
              <div className="fc-head">
                <h5>Nenhum contrato de operador</h5>
                <code>art. 42</code>
              </div>
              <p>
                Nenhum dos 7 clientes ativos tem cláusula de tratamento de
                dados no contrato de prestação de serviço.
              </p>
            </div>
            <div className="finding-card">
              <div className="fc-head">
                <h5>Canal do titular inexistente</h5>
                <code>art. 18</code>
              </div>
              <p>
                Pedido de exclusão chegaria pelo WhatsApp da campanha, sem
                fluxo definido pra tratar.
              </p>
            </div>
          </div>

          <section className="block" id="precos" style={{ paddingTop: 0 }}>
            <div className="block-head">
              <span className="eyebrow" style={{ color: "var(--amber)" }}>
                PREÇOS
              </span>
              <h2>Preço por faixa de contas geridas</h2>
              <p>
                Não cobramos pelo faturamento da agência — cobramos pelo
                número de contas de cliente ativas. A mesma régua da
                contabilidade: por volume, não por &quot;quão
                importante&quot; é o cliente.
              </p>
            </div>
            <div className="plan-grid">
              <div className="plan-card">
                <div className="pname">Start</div>
                <div className="prange">até 10 contas de clientes ativas</div>
                <div className="price">Sob consulta</div>
                <ul>
                  <li>Auditoria trimestral</li>
                  <li>SLA canal do titular: 15 dias úteis</li>
                  <li>Suporte e-mail + chat</li>
                </ul>
                <a
                  className="btn btn-ghost"
                  href="#cta"
                  style={{ borderColor: "rgba(255,255,255,.25)", color: "#fff" }}
                >
                  Falar com a gente
                </a>
              </div>
              <div className="plan-card rec">
                <div className="pname">
                  Growth <span className="badge">Mais comum</span>
                </div>
                <div className="prange">11–30 contas de clientes ativas</div>
                <div className="price">Sob consulta</div>
                <ul>
                  <li>Auditoria mensal</li>
                  <li>SLA canal do titular: 10 dias úteis</li>
                  <li>Suporte prioritário</li>
                </ul>
                <a className="btn btn-violet" href="#cta">
                  Falar com a gente
                </a>
              </div>
              <div className="plan-card">
                <div className="pname">Scale</div>
                <div className="prange">31–100 contas de clientes ativas</div>
                <div className="price">Sob consulta</div>
                <ul>
                  <li>Auditoria semanal</li>
                  <li>SLA canal do titular: 5 dias úteis</li>
                  <li>Gestor de conta dedicado</li>
                </ul>
                <a
                  className="btn btn-ghost"
                  href="#cta"
                  style={{ borderColor: "rgba(255,255,255,.25)", color: "#fff" }}
                >
                  Falar com a gente
                </a>
              </div>
              <div className="plan-card">
                <div className="pname">Enterprise</div>
                <div className="prange">100+ contas de clientes ativas</div>
                <div className="price">Sob consulta</div>
                <ul>
                  <li>Auditoria contínua + alertas</li>
                  <li>SLA definido em contrato</li>
                  <li>DPO dedicado nomeado</li>
                </ul>
                <a
                  className="btn btn-ghost"
                  href="#cta"
                  style={{ borderColor: "rgba(255,255,255,.25)", color: "#fff" }}
                >
                  Falar com o time
                </a>
              </div>
            </div>
            <p className="pricing-foot">
              <strong>Sprint de Higienização</strong> cobrado à parte, com
              crédito na primeira mensalidade se fechar o plano anual junto.
              Valores por faixa ainda em definição — estamos validando com
              agências reais antes de fechar preço;{" "}
              <a href="#cta">fale com a gente</a> pra entrar nessa conversa.
            </p>
          </section>

          <div style={{ textAlign: "center", padding: "3.5rem 0 4rem" }}>
            <h2
              style={{
                color: "#fff",
                fontSize: "clamp(1.8rem,3.4vw,2.5rem)",
                maxWidth: "20ch",
                margin: "0 auto 1rem",
              }}
            >
              Descubra se sua agência já está exposta.
            </h2>
            <p
              style={{
                color: "var(--linen)",
                maxWidth: "44ch",
                margin: "0 auto 1.6rem",
                fontSize: ".96rem",
                fontFamily: "var(--font-body-fam)",
              }}
            >
              Diagnóstico gratuito, baseado em campanhas públicas que você
              já roda. Sem compromisso, sem cadastro de cartão.
            </p>
            <a className="btn btn-violet" href="#top" id="cta">
              Agendar uma análise de especialista
            </a>
            <p
              style={{
                fontSize: ".74rem",
                marginTop: "1rem",
                color: "var(--ash)",
              }}
            >
              O diagnóstico é um documento técnico da Dattum — não
              constitui notificação da ANPD.
            </p>
          </div>

          <nav className="foot-nav">
            <a href="#">Sobre nós</a>
            <a href="#">Equipe de liderança</a>
            <a href="#">Carreiras</a>
            <a href="#precos">Preços</a>
          </nav>
        </div>

        <footer className="site">
          <div className="wrap">
            <div className="foot-top">
              <h3>
                Receba as atualizações de fiscalização da LGPD direto na sua
                caixa de entrada.
              </h3>
              <div>
                <div className="newsletter">
                  <input type="email" placeholder="seu e-mail" />
                  <a className="btn btn-white" href="#cta">
                    Assinar
                  </a>
                </div>
                <p className="newsletter-note">
                  Sem spam. Cancelamento a qualquer momento.
                </p>
              </div>
            </div>
            <div className="foot-grid">
              <div className="foot-brand">
                <a className="wordmark" href="#top">
                  dattum.
                </a>
                <p>
                  Consultoria de compliance LGPD e DPO-as-a-Service para
                  agências de marketing digital e de lançamento.
                </p>
                <div className="social-row">
                  <a href="#" aria-label="LinkedIn">
                    in
                  </a>
                  <a href="#" aria-label="Instagram">
                    ig
                  </a>
                  <a href="#" aria-label="X">
                    x
                  </a>
                </div>
              </div>
              <div className="foot-col">
                <div className="fc-title">Serviço</div>
                <ul>
                  <li>
                    <a href="#top">Diagnóstico de operador</a>
                  </li>
                  <li>
                    <a href="#solucoes">Sprint de higienização</a>
                  </li>
                  <li>
                    <a href="#solucoes">Obrigações acessórias</a>
                  </li>
                  <li>
                    <a href="#precos">Preços</a>
                  </li>
                </ul>
              </div>
              <div className="foot-col">
                <div className="fc-title">Recursos</div>
                <ul>
                  <li>
                    <a href="#exemplo">Exemplo de diagnóstico</a>
                  </li>
                  <li>
                    <a href="#">Central de ajuda</a>
                  </li>
                  <li>
                    <a href="#">Blog jurídico</a>
                  </li>
                </ul>
              </div>
              <div className="foot-col">
                <div className="fc-title">Empresa</div>
                <ul>
                  <li>
                    <a href="#">Sobre</a>
                  </li>
                  <li>
                    <a href="#cta">Contato</a>
                  </li>
                </ul>
              </div>
              <div className="foot-col">
                <div className="fc-title">Legal</div>
                <ul>
                  <li>
                    <a href="#">Política de privacidade</a>
                  </li>
                  <li>
                    <a href="#">Termos de uso</a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="foot-bottom">
              <p className="legal-note">
                Dattum Consultoria em Proteção de Dados. Este site e os
                diagnósticos gerados pela Dattum são documentos privados,
                elaborados pela própria empresa — não constituem
                notificação, autuação ou comunicação oficial da Autoridade
                Nacional de Proteção de Dados (ANPD).
              </p>
              <div className="foot-legal-links">
                <a href="#">Isenção de responsabilidade</a>
                <a href="#">Política de Privacidade</a>
                <a href="#">Configurações de Cookies</a>
                <a href="#">Central Jurídica</a>
              </div>
              <p className="copyline">
                © 2026 Dattum. Todos os direitos reservados.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
