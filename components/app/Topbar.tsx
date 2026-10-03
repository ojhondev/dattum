"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { CircleHelp, Search } from "lucide-react";
import { ThemeToggle } from "@/components/nav/ThemeToggle";
import { useTour } from "@/components/app/Tour";
import { BotaoRelatorio } from "@/components/app/BotaoRelatorio";

const TITULOS: [string, string, string][] = [
  ["/painel/comecar", "Começar", "Preencha uma vez e a Dattis monta a documentação do cliente."],
  ["/painel/relatorio", "Relatório", "A situação de conformidade da carteira, pronta para salvar em PDF."],
  ["/painel/contas", "Clientes", "Cada cliente com registro, contrato e ferramentas em dia."],
  ["/painel/documentos", "Documentos", "Cláusulas, políticas e avisos gerados com os dados de cada cliente."],
  ["/painel/subprocessadores", "Ferramentas", "Quem mais mexe no dado dos seus clientes."],
  ["/painel/vigilancia", "Vigilância", "Varredura diária de segurança nos sites e na documentação."],
  ["/painel/certificados", "Certificados e selo", "Prova de privacidade verificável por QR Code."],
  ["/painel/dossie", "Dossiê para BM", "Contestação de BM suspensa pronta em um clique."],
  ["/painel/titulares", "Pedidos de titulares", "Pedidos das pessoas sobre os próprios dados, com prazo de 15 dias."],
  ["/painel/cookies", "Cookies", "Aviso de cookies, consentimento e Gerenciador de Tags dos sites."],
  ["/painel/configuracoes", "Configurações", "Dados da agência, acesso e documentos legais."],
  ["/painel", "Painel", "Monitore a privacidade e a conformidade da sua carteira em tempo real."],
];

/** Barra superior do painel: onde estou, busca de clientes, tema, ajuda e conta. */
export function Topbar({ agenciaNome }: { agenciaNome: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [busca, setBusca] = useState("");
  const [, titulo, subtitulo] = TITULOS.find(([p]) => pathname === p || pathname.startsWith(p + "/")) ?? TITULOS[TITULOS.length - 1];
  const inicial = agenciaNome.trim()[0]?.toUpperCase() ?? "D";
  const { abrirAjuda } = useTour();

  return (
    <header className="no-print sticky top-0 z-20 flex h-[76px] items-center gap-4 border-b border-line bg-canvas/90 pl-16 pr-4 backdrop-blur sm:pr-10 lg:px-10">
      <div className="min-w-0 flex-1">
        <p className="truncate text-[16px] font-medium text-ink">{titulo}</p>
        <p className="hidden truncate text-[13px] text-muted sm:block">{subtitulo}</p>
      </div>
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          router.push(`/painel/contas?q=${encodeURIComponent(busca.trim())}`);
        }}
        className="hidden w-[300px] items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2 md:flex"
      >
        <Search size={16} className="shrink-0 text-faint" />
        <label htmlFor="busca-painel" className="sr-only">
          Buscar cliente
        </label>
        <input
          id="busca-painel"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar cliente..."
          className="min-w-0 flex-1 bg-transparent text-[14px] text-ink outline-none placeholder:text-faint"
        />
        <kbd className="rounded-md border border-line px-1.5 font-mono text-[10px] text-faint">↵</kbd>
      </form>
      <BotaoRelatorio />
      <ThemeToggle className="grid h-10 w-10 place-items-center rounded-xl border border-line bg-surface text-muted transition-colors hover:text-ink" />
      <button
        type="button"
        onClick={abrirAjuda}
        data-tour="ajuda"
        aria-label="Ajuda"
        className="flex h-10 shrink-0 items-center gap-2 rounded-xl border border-line bg-surface px-2.5 text-[14px] text-muted transition-colors hover:text-ink sm:px-3"
      >
        <CircleHelp size={17} />
        <span className="hidden sm:inline">Ajuda</span>
      </button>
      <span title={agenciaNome} className="pixel-corners pixel-corners-sm grid h-10 w-10 shrink-0 place-items-center bg-rail font-display text-[17px] text-brand">
        {inicial}
      </span>
    </header>
  );
}
