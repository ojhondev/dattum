import { lerConfiguracoes } from "@/lib/blog";
import { WHATSAPP_EXIBICAO, linkContato } from "@/lib/contato";

/** Dados da própria Dattis, editáveis em /admin/seo. Usados nos Termos, na Privacidade e no contrato de dados. */
export type DadosEmpresa = {
  razaoSocial: string;
  cnpj: string | null;
  endereco: string | null;
  emailContato: string | null;
  encarregadoNome: string | null;
  encarregadoEmail: string | null;
  whatsappExibicao: string;
  whatsappLink: string;
};

const ou = (v: string | undefined) => (v && v.trim() ? v.trim() : null);

export async function dadosEmpresa(): Promise<DadosEmpresa> {
  const cfg = await lerConfiguracoes();
  return {
    razaoSocial: ou(cfg.empresa_razao_social) ?? "Dattis",
    cnpj: ou(cfg.empresa_cnpj),
    endereco: ou(cfg.empresa_endereco),
    emailContato: ou(cfg.email_contato),
    encarregadoNome: ou(cfg.encarregado_nome),
    encarregadoEmail: ou(cfg.encarregado_email) ?? ou(cfg.email_contato),
    whatsappExibicao: WHATSAPP_EXIBICAO,
    whatsappLink: linkContato("Olá! Quero falar com a Dattis sobre privacidade e meus dados."),
  };
}
