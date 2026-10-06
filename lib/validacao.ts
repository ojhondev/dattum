// Validações comuns das rotas que recebem dados de quem usa o site.

export const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const SENHA_MIN = 8;
const SENHA_MAX = 200; // teto: uma senha gigante obrigaria o servidor a processar megabytes no hash

/** null se a senha serve; senão, a mensagem de erro para mostrar. */
export function problemaNaSenha(senha: string) {
  if (senha.length < SENHA_MIN) return `A senha precisa ter pelo menos ${SENHA_MIN} caracteres.`;
  if (senha.length > SENHA_MAX) return `A senha pode ter no máximo ${SENHA_MAX} caracteres.`;
  return null;
}
