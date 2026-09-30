import { FileSignature, Network, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { HeroPreview } from "@/components/marketing/HeroPreview";
import { MetaChips } from "@/components/marketing/MetaChips";

export function AuthShell({ children, panelHeadline }: { children: React.ReactNode; panelHeadline: string }) {
  return (
    <div className="grid min-h-svh bg-canvas lg:grid-cols-[minmax(0,500px)_1fr]">
      <div className="flex flex-col px-6 py-8 sm:px-12">
        <Logo height={26} />
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12">{children}</div>
      </div>

      <div className="hidden p-3 lg:block">
        <div className="on-light relative flex h-full flex-col overflow-hidden rounded-[40px] bg-gradient-to-br from-brand to-brand-tint-2 p-12">
          <p className="t-eyebrow !text-rail">RAT · DPA · Subprocessadores · Auditoria</p>
          <p className="font-display mt-5 max-w-lg text-[clamp(2rem,3vw,2.8rem)] leading-[1.1] text-rail">{panelHeadline}</p>

          <div className="relative mt-auto pt-16">
            <div className="ml-auto w-full max-w-xl">
              <HeroPreview />
            </div>
            <MetaChips
              className="absolute bottom-10 left-0 z-10"
              items={[
                { icon: FileSignature, label: "DPA assinado", status: "sim" },
                { icon: Network, label: "Subprocessadores mapeados", status: "sim" },
                { icon: ShieldCheck, label: "Consentimento registrado", status: "nao" },
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
