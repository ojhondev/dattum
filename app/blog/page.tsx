import type { Metadata } from "next";
import { postsPublicados } from "@/lib/blog";
import { BlogIndice } from "@/components/blog/BlogIndice";

export const revalidate = 1800; // 30 min: salvar/publicar no admin já invalida na hora (lib/blog-admin.ts)

export const metadata: Metadata = {
  title: "Blog: LGPD para agências de tráfego pago",
  description:
    "Artigos práticos sobre LGPD para agências de tráfego pago: BM suspensa, Pixel do Meta e consentimento, API de Conversões, lista de clientes, contratos e multas da ANPD.",
  alternates: { canonical: "/blog" },
  openGraph: { type: "website", url: "/blog" },
};

export default async function BlogPage() {
  const posts = await postsPublicados();
  return (
    <BlogIndice
      posts={posts}
      titulo="LGPD para agências de tráfego pago, sem juridiquês"
      subtitulo="O que muda na operação da sua agência: pixel, lista de clientes, API de Conversões, WhatsApp, contratos, BM suspensa e multas — explicado por quem vive tráfego pago."
    />
  );
}
