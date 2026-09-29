import { Logo } from "@/components/brand/Logo";
import { HeroPreview } from "@/components/marketing/HeroPreview";

export function AuthShell({
  children,
  panelHeadline,
}: {
  children: React.ReactNode;
  panelHeadline: string;
}) {
  return (
    <div className="grid min-h-svh lg:grid-cols-[minmax(0,440px)_1fr]">
      <div className="flex flex-col px-6 py-8 sm:px-10">
        <Logo height={24} />
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12">{children}</div>
      </div>

      <div
        className="on-light relative hidden overflow-hidden bg-brand lg:block"
        style={{ backgroundImage: "radial-gradient(rgba(0,40,32,0.10) 1px, transparent 1px)", backgroundSize: "18px 18px" }}
      >
        <div className="absolute inset-0 flex items-center justify-center p-16">
          <div className="w-full max-w-lg rotate-1">
            <HeroPreview />
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 p-10">
          <p className="font-display max-w-md text-[26px] font-light leading-tight tracking-[-0.02em] text-on-brand">{panelHeadline}</p>
          <p className="font-ui mt-4 text-caption uppercase tracking-[0.14em] text-on-brand/70">RAT · DPA · Subprocessadores · Auditoria</p>
        </div>
      </div>
    </div>
  );
}
