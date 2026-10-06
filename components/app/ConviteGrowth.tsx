import { linkContato } from "@/lib/contato";

/** Tela de recurso do Growth/Scale vista por uma agência Start: explica o que é e abre a conversa para mudar de plano. */
export function ConviteGrowth({ titulo, texto, agenciaNome }: { titulo: string; texto: string; agenciaNome: string }) {
  return (
    <div className="max-w-2xl">
      <h1 className="painel-title">{titulo}</h1>
      <p className="painel-lede">{texto}</p>
      <a href={linkContato(`Olá! Quero passar a ${agenciaNome} para o plano Growth da Dattis.`)} target="_blank" rel="noopener" className="painel-btn">
        Falar sobre o Growth
      </a>
    </div>
  );
}

export function ConviteDossie({ agenciaNome }: { agenciaNome: string }) {
  return (
    <ConviteGrowth
      titulo="Dossiê para BM suspensa"
      texto="O dossiê reúne em minutos os documentos que provam que a agência trata os dados do cliente dentro da lei, para contestar a restrição da Business Manager. Ele faz parte dos planos Growth e Scale."
      agenciaNome={agenciaNome}
    />
  );
}
