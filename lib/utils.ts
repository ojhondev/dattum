export { cn } from "cn"

/** Instante atual em ms. Fica fora dos componentes pra a regra de pureza do React não acusar Server Components. */
export const agoraMs = () => Date.now();
