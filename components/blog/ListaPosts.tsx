import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { categoriaSlug, type PostLista } from "@/lib/blog";
import fotoPadrao from "../../public/marketing/especialista.png";

export const dataCurta = (d: Date | null) =>
  d ? d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric", timeZone: "America/Sao_Paulo" }).replace(".", "") : "";

export function AvatarAutor({ autor, tamanho = 60 }: { autor: PostLista["autor"]; tamanho?: number }) {
  const src = autor?.fotoUrl || fotoPadrao;
  return (
    <Image
      src={src}
      alt={autor ? `Foto de ${autor.nome}` : ""}
      width={tamanho}
      height={tamanho}
      sizes={`${tamanho}px`}
      className="shrink-0 rounded-full object-cover"
      style={{ width: tamanho, height: tamanho }}
    />
  );
}

/** Lista de artigos no modelo do proofmode.org/news: título + resumo, autor, etiquetas, data e seta. */
export function ListaPosts({ posts, comBordaFinal = false }: { posts: PostLista[]; comBordaFinal?: boolean }) {
  return (
    <ul>
      {posts.map((p, i) => {
        const href = `/blog/${p.slug}`;
        return (
          <li
            key={p.id}
            className={
              "grid gap-5 py-9 lg:grid-cols-12 lg:gap-4 lg:py-10 " +
              (i < posts.length - 1 || comBordaFinal ? "border-b border-brand-strong/45" : "")
            }
          >
            <div className="lg:col-span-6">
              <h2 className="font-display text-[26px] leading-[1.15] text-ink sm:text-[30px]">
                <Link href={href} className="hover:underline hover:decoration-brand-strong hover:decoration-2 hover:underline-offset-4">
                  {p.titulo}
                </Link>
              </h2>
              {p.resumo && <p className="mt-3 max-w-[60ch] text-[16px] leading-relaxed text-body">{p.resumo}</p>}
            </div>
            <div className="hidden lg:col-span-1 lg:flex lg:justify-center">{p.autor && <AvatarAutor autor={p.autor} />}</div>
            <div className="flex items-start lg:col-span-5 lg:justify-end">
              <div className="flex flex-wrap items-center gap-1 lg:justify-end">
                <Link href={`/blog/categoria/${categoriaSlug(p.categoria)}`} className="tag !bg-brand hover:!bg-brand-strong">
                  {p.categoria}
                </Link>
                {p.tags.slice(0, 1).map((t) => (
                  <span key={t} className="tag !bg-brand">
                    {t}
                  </span>
                ))}
                <time dateTime={p.publicadoEm?.toISOString()} className="tag tag-white">
                  {dataCurta(p.publicadoEm)}
                </time>
                <Link href={href} aria-label={`Ler: ${p.titulo}`} className="arrow-circle">
                  <ArrowRight size={17} strokeWidth={1.7} />
                </Link>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
