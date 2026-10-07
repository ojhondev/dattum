import { ConteudoBloqueado } from "@/components/app/ConteudoBloqueado";

/**
 * Tela de recurso-chave para conta em exploração (vigilância diária, dossiê de BM suspensa): explica o que é
 * e mostra um exemplo fictício borrado, com o cadeado e o botão de ativar o plano.
 */
export function RecursoTravado({ titulo, texto, exemplo }: { titulo: string; texto: string; exemplo: "vigilancia" | "dossie" }) {
  return (
    <div className="max-w-5xl">
      <h1 className="painel-title">{titulo}</h1>
      <p className="painel-lede">{texto}</p>
      <ConteudoBloqueado className="mt-6 rounded-[20px] border border-line" titulo={`${titulo} no plano ativo`} texto="Ative o plano para usar com os seus clientes de verdade.">
        {exemplo === "vigilancia" ? <ExemploVigilancia /> : <ExemploDossie />}
      </ConteudoBloqueado>
    </div>
  );
}

const SITES = [
  { nome: "Loja Exemplo", nota: 92, achados: ["Política de privacidade publicada", "Aviso de cookies ativo"] },
  { nome: "Clínica Exemplo", nota: 61, achados: ["Formulário sem aviso de privacidade", "Pixel carregando antes do consentimento"] },
  { nome: "Imobiliária Exemplo", nota: 38, achados: ["Site sem HTTPS em uma página", "Política desatualizada"] },
];

function ExemploVigilancia() {
  return (
    <div className="grid gap-3 bg-surface p-5 sm:grid-cols-3">
      {SITES.map((s) => (
        <div key={s.nome} className="rounded-2xl border border-line p-4">
          <p className="font-medium text-ink">{s.nome}</p>
          <p className="font-display mt-2 text-[2rem] leading-none text-ink">{s.nota}</p>
          <ul className="mt-3 space-y-1 text-[13px] text-muted">
            {s.achados.map((a) => (
              <li key={a}>• {a}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

const PECAS = [
  "Carta de contestação para a Meta",
  "Registro de atividades do cliente",
  "Contrato de dados assinado",
  "Origem da lista e consentimentos",
  "Ferramentas e subprocessadores",
  "Relatório da vigilância do site",
];

function ExemploDossie() {
  return (
    <div className="bg-surface p-5">
      <p className="font-medium text-ink">Dossiê · Cliente Exemplo · BM restrita por política de dados</p>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {PECAS.map((p) => (
          <li key={p} className="rounded-xl border border-line px-4 py-3 text-[14px] text-body">
            ✓ {p}
          </li>
        ))}
      </ul>
    </div>
  );
}
