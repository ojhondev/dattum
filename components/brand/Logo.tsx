import Link from "next/link";
import Image from "next/image";
import logoLight from "../../public/brand/logo-fundo-claro.png";
import logoDark from "../../public/brand/logo-fundo-dark.png";
import markLight from "../../public/brand/icone-fundo-claro.png";
import markDark from "../../public/brand/icone-fundo-dark.png";

/**
 * Marca Dattis. Duas artes: `logo-fundo-claro` (marca escura, p/ fundo claro) e
 * `logo-fundo-dark` (marca clara, p/ fundo escuro). A troca é por CSS via
 * `[data-theme]` — sem flash, sem JS. Ver `.logo-light` / `.logo-dark` em globals.css.
 */
export function Logo({
  className = "",
  height = 22,
  markOnly = false,
}: {
  className?: string;
  height?: number;
  markOnly?: boolean;
}) {
  const w = (src: { width: number; height: number }) => Math.round((src.width / src.height) * height);

  const light = markOnly ? markLight : logoLight;
  const dark = markOnly ? markDark : logoDark;

  return (
    <Link href="/" aria-label="Dattis" className={"inline-flex shrink-0 " + className}>
      <Image src={light} alt="Dattis" height={height} width={w(light)} priority className="logo-light" />
      <Image src={dark} alt="Dattis" height={height} width={w(dark)} priority className="logo-dark" />
    </Link>
  );
}
