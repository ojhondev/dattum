/** Dados estruturados (schema.org) pro Google entender a página. */
export function JsonLd({ dados }: { dados: Record<string, unknown> | Record<string, unknown>[] }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(dados).replace(/</g, "\u003c") }} />;
}
