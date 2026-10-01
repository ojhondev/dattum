import { SITE_URL, SITE_NOME, SITE_DESCRICAO, urlAbsoluta } from "@/lib/site";
import { EMAIL_CONTATO } from "@/lib/contato";

export function schemaOrganizacao(redes: string[] = []) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organizacao`,
    name: SITE_NOME,
    url: SITE_URL,
    logo: urlAbsoluta("/icon.png"),
    description: SITE_DESCRICAO,
    email: EMAIL_CONTATO,
    areaServed: "BR",
    sameAs: redes.filter(Boolean),
  };
}

export function schemaSite() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#site`,
    url: SITE_URL,
    name: SITE_NOME,
    inLanguage: "pt-BR",
    publisher: { "@id": `${SITE_URL}/#organizacao` },
  };
}

export function schemaBreadcrumb(itens: { nome: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: itens.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.nome, item: urlAbsoluta(it.url) })),
  };
}

export function schemaFaq(perguntas: { pergunta: string; resposta: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: perguntas.map((p) => ({ "@type": "Question", name: p.pergunta, acceptedAnswer: { "@type": "Answer", text: p.resposta } })),
  };
}
