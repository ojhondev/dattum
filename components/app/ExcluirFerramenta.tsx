"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

/** Exclui uma ferramenta cadastrada pela agência. Clientes que já usam continuam com ela pelo nome. */
export function ExcluirFerramenta({ id, nome, emUso }: { id: string; nome: string; emUso: number }) {
  const router = useRouter();
  const excluir = async () => {
    const aviso = emUso
      ? `Excluir "${nome}" da lista da agência? Os ${emUso} cliente(s) que usam continuam com ela no registro e no contrato.`
      : `Excluir "${nome}" da lista da agência?`;
    if (!confirm(aviso)) return;
    await fetch(`/api/ferramentas/${id}`, { method: "DELETE" });
    router.refresh();
  };
  return (
    <button type="button" onClick={excluir} aria-label={`Excluir ${nome}`} className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-surface-2 hover:text-danger">
      <Trash2 size={15} />
    </button>
  );
}
