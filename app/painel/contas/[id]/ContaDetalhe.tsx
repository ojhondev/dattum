"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, BadgeCheck, FileText, FolderOpen, Globe, Network, Pencil, Plus, ScrollText, Trash2, FileBarChart } from "lucide-react";
import { FLUXO_POR_CHAVE, type FlowKey } from "@/lib/fluxos";
import { SiteDaConta, VigilanciaDaConta, type ResultadoVigilancia } from "./VigilanciaConta";
import { ContratoConta, type ContratoDados, type VersaoContrato } from "./ContratoConta";
import { PoliticaPublicaCard } from "@/components/app/PoliticaPublicaCard";
import { CookiesAtalho } from "@/components/app/CookiesAtalho";
import { ModalFerramentas } from "@/components/app/SeletorFerramentas";
import type { FerramentaPropria } from "@/components/app/AdicionarFerramenta";
import { AbasModulo, BarraModulo, CabecalhoDetalhe, ChipSituacao, MenuAcoes } from "@/components/app/Modulo";
import type { EstatisticaCookies } from "@/lib/cookies-stats";
import type { SituacaoDpa } from "@/lib/dpa";

type Atividade = {
  id: string;
  nomeAtividade: string;
  categoriasDado: string;
  finalidade: string;
  baseLegal: string;
  titulares: string;
  prazoRetencao: string;
  fluxo: FlowKey | null;
};

type Subprocessador = { id: string; chave: string | null; nome: string; categoria: string; pais: string; finalidade: string; origem: string };

type Conta = {
  id: string;
  nome: string;
  cnpj: string | null;
  contatoNome: string | null;
  contatoEmail: string | null;
  contatoWhatsapp: string | null;
  site: string | null;
  fluxos: FlowKey[];
};

export type AbaConta = "registro" | "contrato" | "ferramentas" | "site" | "vigilancia";

const CAMPOS: { chave: Exclude<keyof Atividade, "id" | "fluxo" | "nomeAtividade">; label: string }[] = [
  { chave: "categoriasDado", label: "Dados" },
  { chave: "finalidade", label: "Para quê" },
  { chave: "baseLegal", label: "Base legal" },
  { chave: "titulares", label: "De quem" },
  { chave: "prazoRetencao", label: "Por quanto tempo" },
];

/**
 * Uma atividade do registro (RAT), para leigo: em cima só o que a agência faz, quais dados e
 * pra quê. A parte jurídica (base legal, titulares, prazo) fica em "Detalhes técnicos", só de
 * leitura; editar é uma opção avançada lá dentro.
 */
function AtividadeCard({ atividade, contaId }: { atividade: Atividade; contaId: string }) {
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState(atividade);
  const [salvando, setSalvando] = useState(false);
  const fluxo = atividade.fluxo ? FLUXO_POR_CHAVE[atividade.fluxo] : null;

  const salvar = async () => {
    setSalvando(true);
    await fetch(`/api/rat/${contaId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setSalvando(false);
    setEditando(false);
  };

  if (editando) {
    const todos: { chave: Exclude<keyof Atividade, "id" | "fluxo">; label: string }[] = [{ chave: "nomeAtividade", label: "Atividade" }, ...CAMPOS];
    return (
      <article className="bloco p-5 sm:p-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.05em] text-warn">Edição avançada · texto que vai para o registro e o contrato</p>
        <div className="mt-4 grid gap-x-6 gap-y-3 text-[13.5px] md:grid-cols-2">
          {todos.map((c) => (
            <label key={c.chave} htmlFor={`${atividade.id}-${c.chave}`} className={c.chave === "nomeAtividade" || c.chave === "categoriasDado" ? "md:col-span-2" : ""}>
              <span className="text-[12px] text-muted">{c.label}</span>
              <textarea
                id={`${atividade.id}-${c.chave}`}
                rows={2}
                value={form[c.chave]}
                onChange={(e) => setForm((f) => ({ ...f, [c.chave]: e.target.value }))}
                className="field-input mt-1 w-full text-[13.5px]"
              />
            </label>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <button className="barra-btn primario" type="button" onClick={salvar} disabled={salvando}>
            {salvando ? "Salvando..." : "Salvar"}
          </button>
          <button
            className="barra-btn"
            type="button"
            onClick={() => {
              setForm(atividade);
              setEditando(false);
            }}
          >
            Cancelar
          </button>
        </div>
      </article>
    );
  }

  return (
    <article className="bloco p-5 sm:p-6">
      <h3 className="font-display text-[19px] leading-snug text-ink">{fluxo ? fluxo.titulo : form.nomeAtividade}</h3>
      <dl className="mt-3 grid gap-x-8 gap-y-2.5 text-[14px] md:grid-cols-2">
        <div>
          <dt className="text-[12px] text-muted">Quais dados</dt>
          <dd className="mt-0.5 leading-relaxed text-body">{form.categoriasDado}</dd>
        </div>
        <div>
          <dt className="text-[12px] text-muted">Para quê</dt>
          <dd className="mt-0.5 leading-relaxed text-body">{form.finalidade}</dd>
        </div>
      </dl>
      <details className="mt-4 border-t border-line pt-3 text-[13px]">
        <summary className="cursor-pointer text-muted hover:text-ink">Detalhes técnicos (para o advogado ou o contador)</summary>
        <dl className="mt-3 grid gap-x-8 gap-y-2.5 md:grid-cols-2">
          {[
            ["Nome no registro", form.nomeAtividade],
            ["Base legal", form.baseLegal],
            ["De quem são os dados", form.titulares],
            ["Por quanto tempo ficam guardados", form.prazoRetencao],
            ...(fluxo ? [["Por que isso importa", fluxo.risco], ["Como aparece nas plataformas", fluxo.comoChamam]] : []),
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="text-[12px] text-muted">{k}</dt>
              <dd className="mt-0.5 leading-relaxed text-body">{v}</dd>
            </div>
          ))}
        </dl>
        <button type="button" className="barra-btn mt-4" onClick={() => setEditando(true)}>
          <Pencil size={14} /> Editar textos (avançado)
        </button>
      </details>
    </article>
  );
}

const CHIP_CONTRATO: Record<SituacaoDpa, { tom: "ok" | "pendente"; rotulo: string }> = {
  assinado: { tom: "ok", rotulo: "Contrato assinado" },
  aguarda_cliente: { tom: "pendente", rotulo: "Falta o cliente assinar" },
  aguarda_agencia: { tom: "pendente", rotulo: "Falta a agência assinar" },
  rascunho: { tom: "pendente", rotulo: "Contrato sem assinatura" },
};

export default function ContaDetalhe({
  conta,
  atividadesIniciais,
  subprocessadores,
  contrato,
  versoes,
  responsavelPadrao,
  vigilancia,
  abaInicial,
  temDat,
  assinaturaEletronica,
  politica,
  cookies,
  ferramentasProprias,
}: {
  ferramentasProprias: FerramentaPropria[];
  conta: Conta;
  atividadesIniciais: Atividade[];
  subprocessadores: Subprocessador[];
  contrato: ContratoDados | null;
  versoes: VersaoContrato[];
  responsavelPadrao: { nome: string; cargo: string };
  vigilancia: ResultadoVigilancia;
  abaInicial: AbaConta;
  temDat: boolean;
  assinaturaEletronica: boolean;
  politica: { url: string | null; email: string };
  cookies: { token: string | null; config: { cor?: string; politicaUrl?: string; flutuante?: boolean } | null; estatistica: EstatisticaCookies | null; origem: string };
}) {
  const router = useRouter();
  const [aba, setAba] = useState<AbaConta>(abaInicial);
  const [seletor, setSeletor] = useState(false);

  const excluirConta = async () => {
    if (!confirm(`Excluir o cliente "${conta.nome}"? Isso remove o registro, o contrato e as ferramentas dele.`)) return;
    await fetch(`/api/contas/${conta.id}`, { method: "DELETE" });
    router.push("/painel/contas");
    router.refresh();
  };

  const chipContrato = contrato ? CHIP_CONTRATO[contrato.situacao] : null;
  // Um relatório só: o "Relatório para o cliente" (link sempre atualizado, WhatsApp ou PDF). No Start, a versão em PDF.
  const relatorio = temDat ? `/painel/contas/${conta.id}/dat` : `/painel/relatorio?conta=${conta.id}&imprimir=1`;

  return (
    <div>
      <CabecalhoDetalhe
        voltar={{ href: "/painel/contas", rotulo: "Clientes" }}
        titulo={conta.nome}
        meta={
          <>
            {conta.site && (
              <a href={conta.site} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:text-ink">
                <Globe size={13} /> {conta.site.replace(/^https?:\/\//, "")}
              </a>
            )}
            {conta.cnpj && <span>CNPJ {conta.cnpj}</span>}
            <span>{conta.contatoNome ? `Responsável: ${conta.contatoNome}` : "Sem responsável informado"}</span>
          </>
        }
        chips={
          <>
            {chipContrato && <ChipSituacao tom={chipContrato.tom}>{chipContrato.rotulo}</ChipSituacao>}
            <ChipSituacao tom={atividadesIniciais.length ? "ok" : "pendente"}>
              {atividadesIniciais.length ? `${atividadesIniciais.length} atividade(s) no registro` : "Registro vazio"}
            </ChipSituacao>
            <ChipSituacao tom="neutro">{subprocessadores.length} ferramenta(s)</ChipSituacao>
            {vigilancia ? (
              <ChipSituacao tom={vigilancia.nota >= 85 ? "ok" : vigilancia.nota >= 65 ? "pendente" : "alerta"}>Site {vigilancia.nota}/100</ChipSituacao>
            ) : (
              <ChipSituacao tom="neutro">{conta.site ? "Site aguardando verificação" : "Sem site cadastrado"}</ChipSituacao>
            )}
          </>
        }
        acoes={
          <>
            <a href={`/painel/contas/${conta.id}/editar`} className="barra-btn" data-tour="conta-editar">
              <Pencil size={14} /> Editar cliente
            </a>
            <a href={relatorio} className="barra-btn primario" data-tour="conta-relatorio">
              <FileBarChart size={15} /> Relatório para o cliente
            </a>
            <span data-tour="conta-atalhos">
              <MenuAcoes>
                <Link href={`/painel/documentos?conta=${conta.id}&tipo=clausula-contrato`} className="menu-item">
                  <ScrollText size={15} /> Cláusula de LGPD para o contrato
                </Link>
                <Link href={`/painel/documentos?conta=${conta.id}&tipo=politica-privacidade`} className="menu-item">
                  <FileText size={15} /> Política de privacidade (texto)
                </Link>
                <Link href={`/painel/dossie/${conta.id}`} className="menu-item">
                  <FolderOpen size={15} /> Dossiê para BM
                </Link>
                <span className="menu-sep" />
                <button type="button" className="menu-item perigo" onClick={excluirConta}>
                  <Trash2 size={15} /> Excluir cliente
                </button>
              </MenuAcoes>
            </span>
          </>
        }
      />

      <div data-tour="conta-abas">
        <BarraModulo
          esquerda={
            <AbasModulo<AbaConta>
              atual={aba}
              onChange={setAba}
              abas={[
                { id: "registro", rotulo: "Registro (RAT)", n: atividadesIniciais.length },
                { id: "contrato", rotulo: "Contrato" },
                { id: "ferramentas", rotulo: "Ferramentas", n: subprocessadores.length },
                { id: "site", rotulo: "Site e privacidade" },
                { id: "vigilancia", rotulo: "Vigilância" },
              ]}
            />
          }
          direita={
            aba === "ferramentas" ? (
              <>
                <a href="/painel/subprocessadores" className="barra-btn">
                  <Network size={14} /> Ferramentas da agência
                </a>
                <button type="button" className="barra-btn marca" onClick={() => setSeletor(true)}>
                  <Plus size={15} /> Escolher ferramentas
                </button>
              </>
            ) : aba === "registro" ? (
              <a href={`/painel/contas/${conta.id}/editar`} className="barra-btn">
                <Pencil size={14} /> Mudar operações
              </a>
            ) : null
          }
        />
      </div>

      {aba === "registro" && (
        <div className="flex flex-col gap-3">
          {atividadesIniciais.length === 0 ? (
            <Vazio
              texto="Nenhuma atividade no registro. Marque o que a agência faz com os dados deste cliente."
              acao={<a href={`/painel/contas/${conta.id}/editar`} className="barra-btn primario">Marcar operações</a>}
            />
          ) : (
            atividadesIniciais.map((a) => <AtividadeCard key={a.id} atividade={a} contaId={conta.id} />)
          )}
        </div>
      )}

      {aba === "contrato" && (
        <div data-tour="aba-contrato">
          <ContratoConta
            contrato={contrato}
            versoes={versoes}
            contaNome={conta.nome}
            contato={{ nome: conta.contatoNome, email: conta.contatoEmail, whatsapp: conta.contatoWhatsapp }}
            responsavelPadrao={responsavelPadrao}
            assinaturaEletronica={assinaturaEletronica}
          />
        </div>
      )}

      {aba === "ferramentas" &&
        (subprocessadores.length === 0 ? (
          <Vazio
            texto="Nenhuma ferramenta neste cliente. Escolha no catálogo tudo o que recebe dados dele: anúncios, CRM, WhatsApp, e-mail, planilhas."
            acao={
              <button type="button" className="barra-btn marca" onClick={() => setSeletor(true)}>
                <Plus size={15} /> Escolher ferramentas
              </button>
            }
          />
        ) : (
          <>
          <ul className="flex flex-col gap-2 md:hidden">
            {subprocessadores.map((s) => (
              <li key={s.id} className="bloco p-4">
                <p className="text-[15px] font-medium text-ink">{s.nome}</p>
                <p className="mt-0.5 text-[12.5px] text-muted">
                  {s.categoria} · {s.pais} · {s.origem === "manual" ? "escolhida pela agência" : "pelas operações"}
                </p>
                <p className="mt-2 text-[13px] leading-snug text-body">{s.finalidade}</p>
              </li>
            ))}
          </ul>
          <div className="bloco hidden overflow-x-auto md:block">
            <table className="painel-table">
              <thead>
                <tr>
                  <th>Ferramenta</th>
                  <th>Categoria</th>
                  <th>País</th>
                  <th>Como entrou</th>
                </tr>
              </thead>
              <tbody>
                {subprocessadores.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <span className="font-medium">{s.nome}</span>
                      <span className="mt-0.5 block max-w-[46ch] text-[12.5px] leading-snug text-muted">{s.finalidade}</span>
                    </td>
                    <td className="text-muted">{s.categoria}</td>
                    <td className="text-muted">{s.pais}</td>
                    <td>
                      <ChipSituacao tom="neutro">{s.origem === "manual" ? "Escolhida pela agência" : "Pelas operações"}</ChipSituacao>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </>
        ))}

      {aba === "site" && (
        <div className="grid gap-4 xl:grid-cols-2">
          <section className="bloco p-5 xl:col-span-2">
            <p className="font-mono text-[12px] uppercase tracking-[0.04em] text-muted">Site do cliente</p>
            <div className="mt-2">
              <SiteDaConta contaId={conta.id} siteInicial={conta.site} />
            </div>
          </section>
          <div data-tour="conta-politica">
            <PoliticaPublicaCard
              contaId={conta.id}
              titular={conta.nome}
              url={politica.url}
              emailInicial={politica.email}
              emailSugerido={conta.contatoEmail ?? ""}
              bloqueadoPlano={!temDat}
            />
          </div>
          {temDat && <CookiesAtalho href={`/painel/cookies?site=${conta.id}`} ativo={!!cookies.token} escolhas={cookies.estatistica?.total ?? null} />}
          <a href="/painel/certificados" className="bloco flex items-center gap-3 p-5 transition-colors hover:bg-surface-2">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-canvas text-muted">
              <BadgeCheck size={18} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-medium text-ink">Selo de privacidade e certificado</span>
              <span className="mt-0.5 block text-[13.5px] leading-snug text-muted">Saem sozinhos com o contrato assinado. Pegue aqui o código do selo para o rodapé do site.</span>
            </span>
            <ArrowRight size={17} className="shrink-0 text-muted" />
          </a>
        </div>
      )}

      {aba === "vigilancia" && <VigilanciaDaConta contaId={conta.id} resultado={vigilancia} temSite={!!conta.site} cliente={{ nome: conta.nome, site: conta.site }} />}

      {seletor && (
        <ModalFerramentas
          contaId={conta.id}
          proprias={ferramentasProprias}
          aberto
          onFechar={() => setSeletor(false)}
          contratoAssinado={!!contrato && contrato.situacao !== "rascunho"}
          inicial={{
            chaves: subprocessadores.map((s) => s.chave).filter((k): k is string => !!k),
            personalizadas: subprocessadores.filter((s) => !s.chave).map((s) => s.nome),
          }}
        />
      )}
    </div>
  );
}

function Vazio({ texto, acao }: { texto: string; acao?: React.ReactNode }) {
  return (
    <div className="bloco flex flex-col items-center gap-4 px-6 py-12 text-center">
      <p className="max-w-md text-[14.5px] leading-relaxed text-muted">{texto}</p>
      {acao}
    </div>
  );
}
