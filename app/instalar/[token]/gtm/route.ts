import { donoDoToken } from "@/lib/cookies-sites";
import { SITE_URL } from "@/lib/site";

export const runtime = "nodejs";

// Gatilho nativo do Gerenciador de Tags "Consent Initialization - All Pages": roda antes de qualquer
// outra tag, que é onde o padrão de consentimento (tudo negado até o aceite) precisa entrar.
const GATILHO_INICIALIZACAO_CONSENTIMENTO = "2147479573";

/**
 * /instalar/{token}/gtm — arquivo para importar no Gerenciador de Tags (Administrador → Importar contêiner).
 * Cria uma tag "Dattis · Aviso de cookies (LGPD)" que define o consentimento como negado e carrega o aviso.
 * Assim a agência, que costuma ter acesso ao GTM do cliente, instala sem depender do desenvolvedor.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const dono = await donoDoToken(token).catch(() => null);
  if (!dono || dono.tipo === "dattis") return new Response("Aviso de cookies não encontrado.", { status: 404 });

  const html = `<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('consent', 'default', {
    ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied',
    analytics_storage: 'denied', functionality_storage: 'granted', security_storage: 'granted',
    wait_for_update: 500
  });
</script>
<script src="${SITE_URL}/c/${token}.js"></script>`;

  const agora = new Date().toISOString().replace("T", " ").slice(0, 19);
  const arquivo = {
    exportFormatVersion: 2,
    exportTime: agora,
    containerVersion: {
      path: "accounts/0/containers/0/versions/0",
      accountId: "0",
      containerId: "0",
      containerVersionId: "0",
      container: { path: "accounts/0/containers/0", accountId: "0", containerId: "0", name: "Dattis", usageContext: ["WEB"] },
      tag: [
        {
          accountId: "0",
          containerId: "0",
          tagId: "1",
          name: "Dattis · Aviso de cookies (LGPD)",
          type: "html",
          parameter: [
            { type: "TEMPLATE", key: "html", value: html },
            { type: "BOOLEAN", key: "supportDocumentWrite", value: "false" },
          ],
          firingTriggerId: [GATILHO_INICIALIZACAO_CONSENTIMENTO],
          tagFiringOption: "ONCE_PER_EVENT",
          monitoringMetadata: { type: "MAP" },
          consentSettings: { consentStatus: "NOT_NEEDED" },
        },
      ],
    },
  };

  return new Response(JSON.stringify(arquivo, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="dattis-aviso-cookies-gtm.json"`,
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex",
    },
  });
}
