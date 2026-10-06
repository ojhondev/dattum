const ERROS: Record<string, string> = {
  google_indisponivel: "O login com Google ainda não está disponível. Use e-mail e senha.",
  google_cancelado: "O login com Google foi cancelado.",
  google_sessao: "A sessão do login com Google expirou. Tente de novo.",
  google_falhou: "Não foi possível entrar com o Google agora. Tente de novo.",
  google_email: "Esse e-mail do Google ainda não foi verificado.",
  google_sem_conta: "Não encontramos uma conta da Dattis com esse e-mail. Para criar o acesso, use o código de ativação enviado pela Dattis.",
  termos: "Para ativar, aceite os Termos de Uso, a Política de Privacidade e o Contrato de dados.",
  codigo_invalido: "Código de ativação inválido ou já usado. Ele é enviado pela equipe Dattis depois da confirmação do pagamento.",
  google_em_uso: "Essa conta Google já está conectada a outro acesso da Dattis. Use outra conta Google ou desconecte-a lá primeiro.",
  sem_permissao: "Só o dono da conta conecta o login com Google.",
};

export const mensagemErroGoogle = (codigo: string | null) => (codigo ? ERROS[codigo] ?? null : null);

function LogoGoogle() {
  return (
    <svg viewBox="0 0 48 48" width="18" height="18" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

/** Botão “Continuar com Google”. Com `codigo`, ativa uma conta nova vinculada ao Google. */
export function BotaoGoogle({ codigo, proximo, desabilitado = false, rotulo = "Continuar com Google" }: { codigo?: string; proximo?: string | null; desabilitado?: boolean; rotulo?: string }) {
  const params = new URLSearchParams();
  if (codigo) {
    params.set("codigo", codigo.trim());
    params.set("aceite", "1");
  }
  if (proximo) params.set("proximo", proximo);
  const href = `/api/auth/google${params.size ? `?${params}` : ""}`;
  const classe =
    "flex w-full items-center justify-center gap-3 rounded-full border border-line-strong bg-surface px-5 py-3.5 text-[15px] font-medium text-ink transition-colors hover:bg-surface-2";
  if (desabilitado) {
    return (
      <span aria-disabled="true" className={classe + " cursor-not-allowed opacity-50"}>
        <LogoGoogle /> {rotulo}
      </span>
    );
  }
  return (
    <a href={href} className={classe}>
      <LogoGoogle /> {rotulo}
    </a>
  );
}
