import { Download } from "lucide-react";

/**
 * Instalação pelo Gerenciador de Tags, sem desenvolvedor: quem faz tráfego quase sempre tem acesso ao
 * GTM do cliente. Importa um arquivo pronto com a tag do aviso, liga o consentimento nas tags de anúncio e publica.
 */
export function InstalarPeloGtm({ token, origem }: { token: string; origem: string }) {
  return (
    <div className="rounded-2xl border border-line bg-surface-2 p-5">
      <p className="text-[16px] font-medium text-ink">Tem acesso ao Gerenciador de Tags do site? Instale você mesmo</p>
      <p className="mt-1 text-[14px] leading-relaxed text-muted">Sem mexer no código e sem desenvolvedor. Funciona quando o site já tem o Gerenciador de Tags (código GTM-) instalado.</p>
      <a href={`${origem}/instalar/${token}/gtm`} download className="barra-btn primario mt-4">
        <Download size={15} /> Baixar arquivo para o Gerenciador de Tags
      </a>
      <ol className="mt-4 flex list-decimal flex-col gap-2 pl-5 text-[14px] leading-relaxed text-body marker:font-mono marker:text-muted [&_b]:text-ink">
        <li>
          No Gerenciador de Tags do cliente: <b>Administrador → Importar contêiner</b>. Escolha o arquivo baixado, o espaço de trabalho atual, a opção{" "}
          <b>Mesclar</b> e <b>Renomear tags conflitantes</b>. Confirme.
        </li>
        <li>
          Ainda em <b>Administrador → Configurações do contêiner</b>, marque <b>“Ativar visão geral de consentimento”</b> e salve.
        </li>
        <li>
          Abra as tags do <b>Pixel do Meta, TikTok, LinkedIn</b> e outras de anúncio: <b>Configurações avançadas → Configurações de consentimento → Exigir
          consentimento adicional</b> → <code className="font-mono">ad_storage</code>. As tags do Google (Analytics e Google Ads) já respeitam o aviso sozinhas.
        </li>
        <li>
          Clique em <b>Enviar → Publicar</b>. Em alguns minutos a Dattis vê o aviso funcionando no site e marca como instalado.
        </li>
      </ol>
      <p className="mt-3 text-[13px] leading-relaxed text-muted">Algum pixel colado direto no código do site (fora do Gerenciador de Tags)? Esse precisa do passo a passo abaixo.</p>
    </div>
  );
}
