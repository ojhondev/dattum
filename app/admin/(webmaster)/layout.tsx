import { redirect } from "next/navigation";
import { count, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { agencias } from "@/lib/db/schema";
import { isAdmin } from "@/lib/admin";
import { Sidebar } from "@/components/app/Sidebar";
import { SairAdmin } from "./SairAdmin";

export const dynamic = "force-dynamic";

export default async function WebMasterLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAdmin())) redirect("/admin/entrar");
  const [{ n }] = await db.select({ n: count() }).from(agencias).where(isNull(agencias.ativadaEm));

  return (
    <div className="flex min-h-svh bg-canvas">
      <Sidebar variante="admin" agenciaNome="Área Dattis · WebMaster" sairSlot={<SairAdmin />} cadastrosNovos={Number(n)} />
      <main className="min-w-0 flex-1 px-4 pb-16 pt-20 sm:px-10 lg:pt-10">{children}</main>
    </div>
  );
}
