export default function Home() {
  return (
    <>
      <header className="site">
        <div className="wrap">
          <a className="wordmark" href="#top">
            <span className="mark">D.</span>DATTUM
          </a>
          <div className="header-actions">
            <nav className="navlinks">
              <a href="#servico">Serviço</a>
              <a href="#como-funciona">Como funciona</a>
              <a href="#precos">Preços</a>
              <a href="#exemplo">Exemplo de diagnóstico</a>
            </nav>
            <a className="btn btn-ghost" href="#cta">
              Solicitar diagnóstico gratuito
            </a>
          </div>
        </div>
      </header>

      <div className="hero-shell" id="top">
        <div className="wrap">
          <div className="hero">
            <div className="hero-copy rise rise-1">
              <span className="eyebrow">Compliance LGPD para e-commerce</span>
              <h1>
                O encarregado de dados que seu e-commerce deveria ter — e
                muito provavelmente ainda não tem.
              </h1>
              <p className="sub">
                Diagnóstico técnico-jurídico gratuito, sprint de
                regularização em 10 dias úteis, e um Encarregado (DPO) de
                verdade operando — não um nome no rodapé do site.
              </p>
              <div className="chip-row">
                <span className="chip">
                  <span className="num">01</span>Diagnóstico gratuito
                </span>
                <span className="chip">
                  <span className="num">02</span>Sprint de 10 dias
                </span>
                <span className="chip">
                  <span className="num">03</span>DPO recorrente
                </span>
              </div>
              <div className="hero-actions">
                <a className="btn btn-gold" href="#cta">
                  Solicitar diagnóstico gratuito
                </a>
                <a className="btn btn-ghost-dark" href="#exemplo">
                  Ver exemplo de relatório
                </a>
              </div>
              <p className="trust-line">
                Fundamentado na LGPD (Lei 13.709/2018) e na Resolução
                CD/ANPD nº 2/2022. Nunca apresentado como comunicação oficial
                da ANPD.
              </p>
            </div>
            <div className="hero-visual rise rise-3">
              <div className="doc-stack" aria-hidden="true">
                <i></i>
                <i></i>
              </div>
              <div className="report-card">
                <div className="rc-top">
                  <div>
                    <div className="rc-label">Diagnóstico de risco LGPD</div>
                    <div className="rc-title">Loja Exemplo Ltda.</div>
                  </div>
                  <span className="rc-tag">Ilustrativo</span>
                </div>
                <div className="gauge-row">
                  <div className="gauge">
                    <div className="gauge-inner">
                      <span className="n">62</span>
                      <span className="d">/ 100</span>
                    </div>
                  </div>
                  <div className="gauge-label">
                    Score de conformidade atual — quanto menor, maior a
                    exposição.
                  </div>
                </div>
                <div className="finding-list">
                  <div className="finding">
                    <span className="dot"></span>
                    <span>
                      Pixels de terceiros disparando sem consentimento{" "}
                      <code>art. 7º</code>
                    </span>
                  </div>
                  <div className="finding">
                    <span className="dot"></span>
                    <span>
                      Encarregado não publicado no site <code>art. 41</code>
                    </span>
                  </div>
                  <div className="finding">
                    <span className="dot"></span>
                    <span>
                      Política de privacidade genérica, sem tratamento real
                      descrito
                    </span>
                  </div>
                </div>
                <div className="rc-cta">
                  <span>Relatório técnico-jurídico</span>
                  <span>3 achados</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="logo-strip">
        <div className="wrap">
          <div className="cap">Diagnosticamos lojas construídas em</div>
          <span className="plat">Shopify</span>
          <span className="plat">Nuvemshop</span>
          <span className="plat">VTEX</span>
          <span className="plat">WooCommerce</span>
          <span className="plat">Loja Integrada</span>
          <span className="plat">Tray</span>
        </div>
      </div>

      <section className="block" id="servico">
        <div className="wrap">
          <div className="block-head">
            <h2>A operação de compliance da sua loja, em um só lugar</h2>
            <p>
              Seis frentes que normalmente ficam soltas entre a agência, o
              contador e um advogado avulso — reunidas numa única
              assinatura, com um encarregado de verdade supervisionando.
            </p>
          </div>
          <div className="svc-grid">
            <div className="svc-card">
              <div className="svc-num">8.1</div>
              <h4>Motor de diagnóstico</h4>
              <p>
                Varredura contínua do seu site público: pixels, cookies,
                formulários, documentos legais — pega o que muda antes que
                vire problema.
              </p>
            </div>
            <div className="svc-card">
              <div className="svc-num">8.2</div>
              <h4>Políticas & cookies</h4>
              <p>
                Política de privacidade e termos gerados a partir do que sua
                loja realmente coleta — não um template copiado, versionado
                a cada mudança.
              </p>
            </div>
            <div className="svc-card">
              <div className="svc-num">8.3</div>
              <h4>Canal do titular</h4>
              <p>
                Formulário embutível na loja para o cliente pedir acesso,
                correção ou exclusão dos dados dele, com prazo de resposta
                rastreado.
              </p>
            </div>
            <div className="svc-card">
              <div className="svc-num">8.4</div>
              <h4>Gestão de incidentes</h4>
              <p>
                Fluxo de avaliação e checklist de notificação à ANPD e aos
                titulares quando um incidente representa risco relevante.
              </p>
            </div>
            <div className="svc-card">
              <div className="svc-num">8.5</div>
              <h4>Fornecedores & contratos</h4>
              <p>
                Checklist de cláusula LGPD por fornecedor — gateway de
                pagamento, ERP, apps de terceiros — com alerta quando falta
                cobertura.
              </p>
            </div>
            <div className="svc-card">
              <div className="svc-num">8.6</div>
              <h4>Relatório do encarregado</h4>
              <p>
                Todo mês, um relatório com o score atual, o que mudou, e o
                que ainda está pendente — assinado pelo seu DPO.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="block" id="como-funciona">
        <div className="wrap">
          <div className="block-head">
            <h2>
              Regularize em menos tempo do que leva para receber uma
              notificação
            </h2>
            <p>
              O sprint resolve o que é rápido e visível primeiro. O resto
              vira operação contínua — que é o que a LGPD realmente exige.
            </p>
          </div>
          <div className="tl-row">
            <div className="tl-item">
              <div className="tt">Hoje</div>
              <h4>Diagnóstico</h4>
              <p>
                Achados verificáveis do seu site, cada um com o artigo da
                LGPD correspondente e o risco estimado.
              </p>
            </div>
            <div className="tl-item">
              <div className="tt">10 dias úteis depois</div>
              <h4>Sprint concluído</h4>
              <p>
                Política de privacidade real, canal do titular, aviso de
                cookies e encarregado formalmente nomeado.
              </p>
            </div>
            <div className="tl-item">
              <div className="tt">A partir de agora</div>
              <h4>DPO ativo</h4>
              <p>
                Monitoramento contínuo, relatório mensal, e um encarregado de
                verdade respondendo pela sua loja.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="dark-band">
        <div className="wrap">
          <div className="db-grid">
            <div className="rise rise-1">
              <h2>Uma operação de compliance sempre ativa</h2>
              <div className="feature-list">
                <div className="feature-item">
                  <span className="fnum">01</span>
                  <div>
                    <h4>Monitoramento contínuo</h4>
                    <p>
                      O motor de diagnóstico roda de novo sobre a sua loja já
                      cliente — pega o pixel novo, o app novo, a política que
                      ficou desatualizada.
                    </p>
                  </div>
                </div>
                <div className="feature-item">
                  <span className="fnum">02</span>
                  <div>
                    <h4>Um DPO humano por trás</h4>
                    <p>
                      Toda decisão sobre incidente e toda resposta sensível a
                      um titular é revisada por um encarregado de verdade —
                      não só automação.
                    </p>
                  </div>
                </div>
                <div className="feature-item">
                  <span className="fnum">03</span>
                  <div>
                    <h4>Trilha 100% auditável</h4>
                    <p>
                      Cada mudança, resposta e decisão fica registrada —
                      prova de boa-fé e mitigação em caso de fiscalização.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="monitor-card rise rise-3">
              <div className="mc-title">Canais monitorados · Loja Exemplo</div>
              <div className="mon-row">
                <span>Pixels & cookies</span>
                <span className="mon-status mon-ok">Em conformidade</span>
              </div>
              <div className="mon-row">
                <span>Política de privacidade</span>
                <span className="mon-status mon-ok">Em conformidade</span>
              </div>
              <div className="mon-row">
                <span>Canal do titular</span>
                <span className="mon-status mon-ok">Em conformidade</span>
              </div>
              <div className="mon-row">
                <span>Contratos com fornecedores</span>
                <span className="mon-status mon-pending">2 pendentes</span>
              </div>
              <div className="mon-row">
                <span>Registro de incidentes</span>
                <span className="mon-status mon-ok">Sem ocorrências</span>
              </div>
            </div>
          </div>
          <div className="stat-bar">
            <div className="stat-item">
              <div className="sv">2%</div>
              <div className="sl">
                teto de multa sobre o faturamento, por infração — art. 52
              </div>
            </div>
            <div className="stat-item">
              <div className="sv">R$50 mi</div>
              <div className="sl">
                teto de multa por infração, em valor absoluto
              </div>
            </div>
            <div className="stat-item">
              <div className="sv">10 dias</div>
              <div className="sl">
                úteis, do diagnóstico ao sprint concluído
              </div>
            </div>
            <div className="stat-item">
              <div className="sv">R$0</div>
              <div className="sl">custo do diagnóstico inicial</div>
            </div>
          </div>
        </div>
      </div>

      <section className="block" id="exemplo">
        <div className="wrap">
          <span className="ex-tag">
            Exemplo ilustrativo — não é um cliente real
          </span>
          <div className="ex-grid">
            <div>
              <h2 className="ex-title">
                É assim que um diagnóstico chega até você
              </h2>
              <p className="ex-desc">
                A &quot;Loja Exemplo Ltda.&quot; abaixo é fictícia —
                construída para mostrar a estrutura real de um relatório:
                fato verificável, artigo da lei, risco. Nenhum relatório da
                Dattum afirma ser uma comunicação da ANPD.
              </p>
              <a className="btn btn-ghost" href="#cta">
                Solicitar o diagnóstico da sua loja
              </a>
            </div>
            <div>
              <div className="finding-card">
                <div className="fc-head">
                  <h5>Pixels de terceiros sem consentimento</h5>
                  <code>art. 7º</code>
                </div>
                <p>
                  Meta Pixel e TikTok Pixel disparam antes de qualquer
                  interação com o banner de cookies. Sem base legal
                  registrada para o tratamento.
                </p>
              </div>
              <div className="finding-card">
                <div className="fc-head">
                  <h5>Encarregado não publicado</h5>
                  <code>art. 41</code>
                </div>
                <p>
                  Nenhum canal de contato do encarregado foi localizado no
                  rodapé, na política de privacidade ou em página
                  institucional.
                </p>
              </div>
              <div className="finding-card">
                <div className="fc-head">
                  <h5>Canal do titular inexistente</h5>
                  <code>art. 18</code>
                </div>
                <p>
                  Não há formulário nem e-mail dedicado para o titular
                  exercer acesso, correção ou eliminação dos seus dados.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="block" id="precos">
        <div className="wrap">
          <div className="block-head">
            <h2>Preço por faixa de faturamento</h2>
            <p>
              A mesma régua que a Resolução CD/ANPD nº 2/2022 usa para
              diferenciar agente de pequeno porte — e que correlaciona com o
              teto de multa do art. 52.
            </p>
          </div>
          <div className="plan-grid">
            <div className="plan-card">
              <div className="pname">Essencial</div>
              <div className="prange">Até R$ 1,2 mi/ano</div>
              <div className="price">
                R$ 690<span className="per">/mês</span>
              </div>
              <ul>
                <li>Até 3 fornecedores monitorados</li>
                <li>Auditoria contínua trimestral</li>
                <li>SLA canal do titular: 15 dias úteis</li>
              </ul>
              <a className="btn btn-ghost" href="#cta">
                Começar
              </a>
            </div>
            <div className="plan-card rec">
              <div className="pname">
                Crescimento <span className="badge">Mais comum</span>
              </div>
              <div className="prange">R$ 1,2 mi – R$ 10 mi/ano</div>
              <div className="price">
                R$ 1.490<span className="per">/mês</span>
              </div>
              <ul>
                <li>Até 10 fornecedores monitorados</li>
                <li>Auditoria contínua mensal</li>
                <li>SLA canal do titular: 10 dias úteis</li>
              </ul>
              <a className="btn btn-gold" href="#cta">
                Começar
              </a>
            </div>
            <div className="plan-card">
              <div className="pname">Escala</div>
              <div className="prange">R$ 10 mi – R$ 50 mi/ano</div>
              <div className="price">
                R$ 2.990<span className="per">/mês</span>
              </div>
              <ul>
                <li>Fornecedores ilimitados</li>
                <li>Auditoria contínua semanal</li>
                <li>Gestor de conta dedicado</li>
              </ul>
              <a className="btn btn-ghost" href="#cta">
                Começar
              </a>
            </div>
            <div className="plan-card">
              <div className="pname">Enterprise</div>
              <div className="prange">Acima de R$ 50 mi/ano ou multi-loja</div>
              <div className="price">Sob consulta</div>
              <ul>
                <li>Multi-tenant ilimitado</li>
                <li>Alertas em tempo real</li>
                <li>DPO dedicado nomeado</li>
              </ul>
              <a className="btn btn-ghost" href="#cta">
                Falar com o time
              </a>
            </div>
          </div>
          <p className="pricing-foot">
            <strong>Sprint de Regularização</strong> cobrado à parte (de R$
            1.900 a R$ 7.900, conforme a faixa) — com 50% de crédito na
            primeira mensalidade se você fechar o plano anual junto.{" "}
            <strong>Desconto de 15%</strong> no plano anual. Cancelamento com
            aviso de 30 dias, para transição responsável do encarregado.
          </p>
        </div>
      </section>

      <div className="cta-band" id="cta">
        <div className="wrap">
          <h2>Descubra o que um auditor encontraria na sua loja hoje.</h2>
          <p>
            Diagnóstico gratuito, baseado apenas em dados públicos do seu
            site. Sem compromisso, sem cadastro de cartão.
          </p>
          <a className="btn btn-gold" href="#top">
            Solicitar diagnóstico gratuito
          </a>
          <p className="note">
            O diagnóstico é um documento técnico da Dattum — não constitui
            notificação da ANPD.
          </p>
        </div>
      </div>

      <footer className="site">
        <div className="wrap">
          <div className="foot-grid">
            <div className="foot-brand">
              <a className="wordmark" href="#top">
                <span className="mark">D.</span>DATTUM
              </a>
              <p>
                Consultoria de compliance LGPD e DPO-as-a-Service, exclusiva
                para e-commerces.
              </p>
            </div>
            <div className="foot-col">
              <div className="fc-title">Serviço</div>
              <ul>
                <li>
                  <a href="#top">Diagnóstico</a>
                </li>
                <li>
                  <a href="#como-funciona">Sprint de regularização</a>
                </li>
                <li>
                  <a href="#servico">Assinatura DPO</a>
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
              elaborados pela própria empresa — não constituem notificação,
              autuação ou comunicação oficial da Autoridade Nacional de
              Proteção de Dados (ANPD).
            </p>
            <p className="copyline">© 2026 Dattum</p>
          </div>
        </div>
      </footer>
    </>
  );
}
