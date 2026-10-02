import { createHash } from "node:crypto";
import type { ConfigCookies } from "@/lib/db/schema";

// Aviso de cookies da Dattis: um script único por site (/c/{token}.js), colado no topo do <head>.
// 1) Antes de qualquer tag: Modo de consentimento v2 do Google com tudo negado (exceto o essencial).
// 2) Scripts marcados com type="text/plain" data-dattis-categoria="marketing|estatisticas" só rodam com aceite.
// 3) Escolha guardada no navegador (cookie dattis_consent, 12 meses) e registrada na Dattis como prova.

export const TEXTO_PADRAO =
  "Usamos cookies para o site funcionar e, com a sua permissão, para medir as visitas e mostrar anúncios mais relevantes. Você pode aceitar, recusar ou escolher o que permitir.";

export type ConfigScript = {
  token: string;
  texto: string;
  politicaUrl: string | null;
  cor: string;
  flutuante: boolean;
  ignorar: string[]; // caminhos onde o aviso não aparece (ex.: área logada)
  api: string;
  marcaUrl: string;
};

export const versaoDoTexto = (c: Pick<ConfigScript, "texto" | "politicaUrl">) =>
  createHash("sha256").update(`${c.texto}|${c.politicaUrl ?? ""}|categorias:v1`).digest("hex").slice(0, 10);

export function configParaScript(token: string, cfg: ConfigCookies | null, base: { api: string; marcaUrl: string; politicaPadrao: string | null; ignorar?: string[] }): ConfigScript {
  return {
    token,
    texto: cfg?.texto?.trim() || TEXTO_PADRAO,
    politicaUrl: cfg?.politicaUrl?.trim() || base.politicaPadrao,
    cor: /^#[0-9a-f]{6}$/i.test(cfg?.cor ?? "") ? cfg!.cor! : "#002820",
    flutuante: cfg?.flutuante ?? true,
    ignorar: base.ignorar ?? [],
    api: base.api,
    marcaUrl: base.marcaUrl,
  };
}

// O runtime abaixo vai para o navegador do visitante como texto: JavaScript puro, sem dependências.
const RUNTIME = String.raw`
(function () {
  var w = window, d = document;
  if (w.DattisCookies) return;
  var NOME = 'dattis_consent', DIAS = 365;
  w.dataLayer = w.dataLayer || [];
  function gtag() { w.dataLayer.push(arguments); }
  if (typeof w.gtag !== 'function') w.gtag = gtag;

  // 1) Padrão do Google: nada de anúncio ou medição até a escolha.
  gtag('consent', 'default', {
    ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied',
    analytics_storage: 'denied', functionality_storage: 'granted', security_storage: 'granted',
    wait_for_update: 500
  });
  gtag('set', 'ads_data_redaction', true);

  function ler() {
    try {
      var m = d.cookie.match(new RegExp('(?:^|; )' + NOME + '=([^;]*)'));
      var v = m ? decodeURIComponent(m[1]) : (w.localStorage && localStorage.getItem(NOME));
      return v ? JSON.parse(v) : null;
    } catch (e) { return null; }
  }
  function gravar(v) {
    var s = JSON.stringify(v);
    try { d.cookie = NOME + '=' + encodeURIComponent(s) + '; max-age=' + DIAS * 86400 + '; path=/; SameSite=Lax' + (location.protocol === 'https:' ? '; Secure' : ''); } catch (e) {}
    try { localStorage.setItem(NOME, s); } catch (e) {}
  }
  function idVisitante(v) {
    if (v && v.id) return v.id;
    var a = new Uint8Array(12); (w.crypto || {}).getRandomValues ? crypto.getRandomValues(a) : a.forEach(function (_, i) { a[i] = Math.random() * 256; });
    return Array.prototype.map.call(a, function (b) { return ('0' + b.toString(16)).slice(-2); }).join('');
  }

  function ativarScripts(cats) {
    var lista = d.querySelectorAll('script[type="text/plain"][data-dattis-categoria]');
    for (var i = 0; i < lista.length; i++) {
      var s = lista[i];
      if (s.getAttribute('data-dattis-ativo') || !cats[s.getAttribute('data-dattis-categoria')]) continue;
      var n = d.createElement('script');
      for (var j = 0; j < s.attributes.length; j++) {
        var at = s.attributes[j];
        if (at.name !== 'type' && at.name !== 'data-dattis-categoria') n.setAttribute(at.name, at.value);
      }
      if (!s.src) n.text = s.text;
      s.setAttribute('data-dattis-ativo', '1');
      s.parentNode.insertBefore(n, s.nextSibling);
    }
  }

  function aplicar(cats) {
    var m = cats.marketing ? 'granted' : 'denied', e = cats.estatisticas ? 'granted' : 'denied';
    gtag('consent', 'update', { ad_storage: m, ad_user_data: m, ad_personalization: m, analytics_storage: e });
    w.dataLayer.push({ event: 'dattis_consentimento', dattis_estatisticas: !!cats.estatisticas, dattis_marketing: !!cats.marketing });
    if (typeof w.fbq === 'function') { try { w.fbq('consent', cats.marketing ? 'grant' : 'revoke'); } catch (x) {} }
    if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', function () { ativarScripts(cats); });
    else ativarScripts(cats);
  }

  var salvo = ler();
  var valido = salvo && salvo.v === C.versao && salvo.c;
  if (valido) aplicar(salvo.c);

  function registrar(acao, cats, id) {
    var corpo = JSON.stringify({ token: C.token, acao: acao, categorias: cats, versao: C.versao, url: location.origin + location.pathname, visitante: id });
    try {
      if (navigator.sendBeacon) navigator.sendBeacon(C.api, new Blob([corpo], { type: 'text/plain' }));
      else fetch(C.api, { method: 'POST', body: corpo, keepalive: true, mode: 'no-cors' });
    } catch (e) {}
  }

  function escolher(acao, cats) {
    var id = idVisitante(salvo);
    salvo = { v: C.versao, c: cats, t: Date.now(), id: id };
    gravar(salvo);
    aplicar(cats);
    registrar(acao, cats, id);
    fechar();
    mostrarFlutuante();
  }

  // ---------- Interface (Shadow DOM: o CSS do site não interfere) ----------
  var host, raiz, painelAberto = false;
  function claro(hex) {
    var n = parseInt(hex.slice(1), 16), r = n >> 16 & 255, g = n >> 8 & 255, b = n & 255;
    return (0.299 * r + 0.587 * g + 0.114 * b) > 150;
  }
  var CSS =
    ':host{all:initial;color-scheme:light}' +
    '*{box-sizing:border-box;font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif}' +
    '.b{position:fixed;left:16px;right:16px;bottom:16px;z-index:2147483646;max-width:980px;margin:0 auto;background:#fff;color:#1c2422;border:1px solid #dfe5e2;border-radius:20px;box-shadow:0 18px 50px -12px rgba(0,0,0,.35);padding:20px 22px;animation:e .3s ease-out}' +
    '@keyframes e{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}' +
    '@media (prefers-reduced-motion:reduce){.b{animation:none}}' +
    '.h{display:flex;align-items:center;gap:8px;font-size:15px;font-weight:700;margin:0 0 6px}' +
    '.t{font-size:14px;line-height:1.55;margin:0}.t a{color:inherit;text-decoration:underline;text-underline-offset:2px}' +
    '.r{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-top:14px}' +
    '.btn{appearance:none;border-radius:999px;padding:10px 18px;font-size:14px;font-weight:600;cursor:pointer;border:1px solid transparent;line-height:1}' +
    '.a{background:' + C.cor + ';color:' + (claro(C.cor) ? '#0b1714' : '#fff') + '}' +
    '.g{background:transparent;border-color:#c9d3cf;color:#1c2422}' +
    '.l{background:none;border:0;padding:10px 6px;font-size:14px;text-decoration:underline;cursor:pointer;color:inherit}' +
    '.btn:focus-visible,.l:focus-visible,input:focus-visible{outline:2px solid ' + C.cor + ';outline-offset:2px}' +
    '.m{margin-left:auto;display:inline-flex;align-items:center;gap:6px;font:600 10px/1 ui-monospace,SFMono-Regular,monospace;letter-spacing:.06em;text-transform:uppercase;text-decoration:none;color:#002820;background:#45d190;padding:6px 9px;clip-path:polygon(0 3px,3px 3px,3px 0,calc(100% - 3px) 0,calc(100% - 3px) 3px,100% 3px,100% calc(100% - 3px),calc(100% - 3px) calc(100% - 3px),calc(100% - 3px) 100%,3px 100%,3px calc(100% - 3px),0 calc(100% - 3px))}' +
    '.op{display:flex;gap:12px;align-items:flex-start;justify-content:space-between;border-top:1px solid #e7ece9;padding:12px 0}' +
    '.op b{font-size:14px}.p{font-size:13px;line-height:1.5;color:#5b6763;margin:2px 0 0}' +
    '.sw{position:relative;width:42px;height:24px;flex:none}.sw input{opacity:0;width:100%;height:100%;margin:0;cursor:pointer;position:absolute;z-index:1}' +
    '.sw span{position:absolute;inset:0;border-radius:99px;background:#c9d3cf;transition:.2s}.sw span:after{content:"";position:absolute;width:18px;height:18px;left:3px;top:3px;border-radius:50%;background:#fff;transition:.2s}' +
    '.sw input:checked+span{background:' + C.cor + '}.sw input:checked+span:after{transform:translateX(18px)}.sw input:disabled+span{opacity:.6}' +
    '.f{position:fixed;left:16px;bottom:16px;z-index:2147483645;width:44px;height:44px;border-radius:50%;border:1px solid #dfe5e2;background:#fff;box-shadow:0 6px 20px rgba(0,0,0,.18);cursor:pointer;display:grid;place-items:center;padding:0}' +
    '@media (max-width:640px){.b{left:8px;right:8px;bottom:8px;padding:16px}.btn{flex:1 1 auto}.m{margin-left:0}}';

  var ICONE = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"/><circle cx="8.5" cy="8.5" r=".8" fill="currentColor"/><circle cx="16" cy="15.5" r=".8" fill="currentColor"/><circle cx="12" cy="17" r=".8" fill="currentColor"/><circle cx="7" cy="14" r=".8" fill="currentColor"/></svg>';

  function montarRaiz() {
    if (raiz) return;
    host = d.createElement('div');
    host.id = 'dattis-cookies';
    d.body.appendChild(host);
    raiz = host.attachShadow ? host.attachShadow({ mode: 'open' }) : host;
    var st = d.createElement('style'); st.textContent = CSS; raiz.appendChild(st);
  }
  function el(html) { var t = d.createElement('div'); t.innerHTML = html; return t.firstChild; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function fechar() {
    var b = raiz && raiz.querySelector('.b'); if (b) b.remove();
    painelAberto = false;
  }

  function mostrar(personalizar) {
    montarRaiz();
    fechar();
    var f = raiz.querySelector('.f'); if (f) f.remove();
    painelAberto = true;
    var atual = (salvo && salvo.c) || { estatisticas: false, marketing: false };
    var politica = C.politicaUrl ? ' <a href="' + esc(C.politicaUrl) + '" target="_blank" rel="noopener">Política de privacidade</a>.' : '';
    var opcoes = personalizar
      ? '<div style="margin-top:10px">' +
        '<div class="op"><div><b>Necessários</b><p class="p">Fazem o site funcionar, como lembrar esta escolha. Sempre ativos.</p></div><label class="sw"><input type="checkbox" checked disabled aria-label="Necessários"><span></span></label></div>' +
        '<div class="op"><div><b>Estatísticas</b><p class="p">Medem visitas e uso do site, como o Google Analytics.</p></div><label class="sw"><input type="checkbox" name="estatisticas" aria-label="Estatísticas"' + (atual.estatisticas ? ' checked' : '') + '><span></span></label></div>' +
        '<div class="op"><div><b>Marketing</b><p class="p">Pixels de anúncio (Meta, Google Ads, TikTok) para medir campanhas e mostrar anúncios.</p></div><label class="sw"><input type="checkbox" name="marketing" aria-label="Marketing"' + (atual.marketing ? ' checked' : '') + '><span></span></label></div>' +
        '</div>'
      : '';
    var botoes = personalizar
      ? '<button class="btn a" data-a="salvar">Salvar escolhas</button><button class="btn g" data-a="recusar">Recusar todos</button><button class="btn g" data-a="aceitar">Aceitar todos</button>'
      : '<button class="btn a" data-a="aceitar">Aceitar todos</button><button class="btn g" data-a="recusar">Recusar</button><button class="l" data-a="personalizar">Personalizar</button>';
    var b = el(
      '<div class="b" role="dialog" aria-modal="false" aria-label="Aviso de cookies">' +
        '<p class="h">' + ICONE + ' Sua privacidade</p>' +
        '<p class="t">' + esc(C.texto) + politica + '</p>' + opcoes +
        '<div class="r">' + botoes +
        '<a class="m" href="' + esc(C.marcaUrl) + '" target="_blank" rel="noopener" title="Aviso de cookies e conformidade LGPD pela Dattis">Protegido por Dattis</a></div>' +
      '</div>'
    );
    b.addEventListener('click', function (ev) {
      var a = ev.target.closest && ev.target.closest('[data-a]'); if (!a) return;
      var acao = a.getAttribute('data-a');
      if (acao === 'aceitar') escolher('aceitar', { estatisticas: true, marketing: true });
      else if (acao === 'recusar') escolher('recusar', { estatisticas: false, marketing: false });
      else if (acao === 'personalizar') mostrar(true);
      else if (acao === 'salvar') escolher('personalizar', { estatisticas: !!b.querySelector('[name=estatisticas]').checked, marketing: !!b.querySelector('[name=marketing]').checked });
    });
    raiz.appendChild(b);
    var primeiro = b.querySelector('[data-a]'); if (primeiro && personalizar) primeiro.focus();
  }

  function mostrarFlutuante() {
    if (!C.flutuante || !raiz || raiz.querySelector('.f')) return;
    var f = el('<button class="f" aria-label="Preferências de cookies" title="Preferências de cookies">' + ICONE + '</button>');
    f.addEventListener('click', function () { mostrar(true); });
    raiz.appendChild(f);
  }

  function ignorado() {
    var p = location.pathname;
    for (var i = 0; i < C.ignorar.length; i++) if (p === C.ignorar[i] || p.indexOf(C.ignorar[i] + '/') === 0) return true;
    return false;
  }

  function iniciar() {
    d.addEventListener('click', function (ev) {
      var a = ev.target.closest && ev.target.closest('[data-dattis-cookies]');
      if (a) { ev.preventDefault(); mostrar(true); }
    });
    if (ignorado()) return;
    if (!valido) mostrar(false);
    else { montarRaiz(); mostrarFlutuante(); }
  }
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', iniciar); else iniciar();

  w.DattisCookies = {
    abrir: function () { mostrar(true); },
    consentimento: function () { return salvo && salvo.c ? { estatisticas: !!salvo.c.estatisticas, marketing: !!salvo.c.marketing } : null; }
  };
})();
`;

export function gerarScript(c: ConfigScript) {
  const cfg = { ...c, versao: versaoDoTexto(c) };
  // JSON dentro de <script>/JS: escapa "<" para não fechar a tag em nenhum caso.
  return `/*! Aviso de cookies Dattis */\n(function (C) {${RUNTIME}})(${JSON.stringify(cfg).replace(/</g, "\\u003c")});`;
}
