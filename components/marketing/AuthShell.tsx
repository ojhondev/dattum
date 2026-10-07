import { Logo } from "@/components/brand/Logo";
import { HeroStrip } from "@/components/marketing/HeroStrip";

/**
 * Moldura das telas de entrar/cadastro. O painel verde fica preso na tela (o formulário rola ao lado)
 * e mostra a mesma faixa animada do hero da home, logo abaixo do título, centralizada na altura.
 */
export function AuthShell({ children, panelHeadline }: { children: React.ReactNode; panelHeadline: string }) {
  return (
    <div className="grid min-h-svh grid-cols-1 bg-canvas lg:grid-cols-[minmax(0,500px)_minmax(0,1fr)]">
      <div className="flex flex-col px-6 py-8 sm:px-12">
        <Logo height={26} />
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12">{children}</div>
      </div>

      <div className="hidden min-w-0 p-3 lg:sticky lg:top-0 lg:block lg:h-svh">
        <div className="on-light relative flex h-full flex-col justify-center overflow-hidden rounded-[40px] bg-gradient-to-br from-brand to-brand-tint-2 py-12">
          <div className="px-12">
            <p className="t-eyebrow !text-rail">RAT · DPA · Subprocessadores · Auditoria</p>
            <p className="font-display mt-5 max-w-xl text-[clamp(2rem,3vw,2.8rem)] leading-[1.1] text-rail">{panelHeadline}</p>
          </div>
          <div className="mt-6">
            <HeroStrip />
          </div>
        </div>
      </div>
    </div>
  );
}
