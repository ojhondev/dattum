import {
  LayoutGrid,
  Info,
  BadgeCheck,
  FolderOpen,
  UserRoundCheck,
  Gauge,
  ScanSearch,
  SearchCheck,
  Calculator,
  Tags,
  Scale,
  Trophy,
  CircleHelp,
  MessageCircle,
  Newspaper,
  Cookie,
  Radar,
  type LucideIcon,
} from "lucide-react";
import { WHATSAPP_EXIBICAO, linkContato } from "@/lib/contato";

export type NavItem = { href: string; label: string; desc: string; icon: LucideIcon };
export type NavGroup = { label: string; items: NavItem[] };

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Plataforma",
    items: [
      { href: "/#dpo", label: "A Dattis como seu DPO", desc: "Nós cuidamos da LGPD de cada cliente por você.", icon: UserRoundCheck },
      { href: "/#modulos", label: "O que o DPO entrega", desc: "Registro, contrato, ferramentas, auditoria e relatório.", icon: LayoutGrid },
      { href: "/#modulos", label: "Certificado e selo", desc: "Prova verificável por QR Code no rodapé do site.", icon: BadgeCheck },
      { href: "/#bm-suspensa", label: "Dossiê para BM", desc: "Contestação organizada quando a BM é suspensa.", icon: FolderOpen },
    ],
  },
  {
    label: "Funcionalidades",
    items: [
      { href: "/#func-cookies", label: "Aviso de cookies", desc: "Banner que segura o pixel até o aceite, com prova.", icon: Cookie },
      { href: "/#func-gtm", label: "Google Tag Manager", desc: "Modo de consentimento v2 e instalação guiada.", icon: Tags },
      { href: "/#func-selo", label: "Selo verificável", desc: "No rodapé da agência e de cada cliente.", icon: BadgeCheck },
      { href: "/#func-vigilancia", label: "Monitoramento diário", desc: "Vigilância automática dos sites às 6h.", icon: Radar },
      { href: "/#funcionalidades", label: "Ver todas", desc: "Política pronta, canal do titular, relatório e mais.", icon: LayoutGrid },
    ],
  },
  {
    label: "Ferramentas",
    items: [
      { href: "/diagnostico", label: "Auditoria da sua agência", desc: "19 perguntas: descubra quanto sua agência está exposta.", icon: Gauge },
      { href: "/auditoria", label: "Auditoria de site", desc: "Pixel, formulário e política de privacidade.", icon: ScanSearch },
      { href: "/consulta", label: "Consulta por CNPJ", desc: "Veja se uma agência está em conformidade com a LGPD.", icon: SearchCheck },
      { href: "/#calculadora", label: "Calculadora de risco", desc: "Multa x custo: quanto sua agência arrisca sem LGPD.", icon: Calculator },
    ],
  },
  {
    label: "Planos",
    items: [
      { href: "/planos", label: "Planos e preços", desc: "Start: você faz. Growth e Scale: a Dattis é o seu DPO.", icon: Tags },
      { href: "/#multa", label: "Multa x DPO", desc: "Quanto custa estar sem DPO quando a fiscalização chega.", icon: Scale },
    ],
  },
  {
    label: "Sobre",
    items: [
      { href: "/o-que-e-a-dattis", label: "O que é a Dattis", desc: "O que é, por que existe e para quem é.", icon: Info },
      { href: "/blog", label: "Blog", desc: "LGPD e tráfego pago, sem juridiquês.", icon: Newspaper },
      { href: "/#diferencial", label: "Diferencial competitivo", desc: "Privacidade como argumento de venda da agência.", icon: Trophy },
      { href: "/#faq", label: "Perguntas frequentes", desc: "DPO, planos, selo, BM suspensa e preços.", icon: CircleHelp },
      { href: linkContato("Olá! Vim pelo site da Dattis e quero falar com a equipe."), label: "WhatsApp", desc: WHATSAPP_EXIBICAO, icon: MessageCircle },
    ],
  },
];
