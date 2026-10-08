"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { cnpjValido, digitosCnpj, mascaraCnpj } from "@/lib/cnpj";

/** Campo de busca por CNPJ, com máscara e conferência dos dígitos antes de consultar. */
export function FormConsulta({ inicial = "" }: { inicial?: string }) {
  const router = useRouter();
  const [cnpj, setCnpj] = useState(mascaraCnpj(inicial));
  const [erro, setErro] = useState("");
  const [buscando, setBuscando] = useState(false);

  const consultar = (e: FormEvent) => {
    e.preventDefault();
    if (!cnpjValido(cnpj)) return setErro("Esse CNPJ não é válido. Confira os 14 números.");
    setErro("");
    setBuscando(true);
    router.push(`/consulta?cnpj=${digitosCnpj(cnpj)}#resultado`);
    setTimeout(() => setBuscando(false), 1200);
  };

  return (
    <form onSubmit={consultar} className="mx-auto mt-9 w-full max-w-xl">
      <div className="flex flex-col gap-2 rounded-[28px] border border-line-strong bg-surface p-2 shadow-[0_18px_40px_-24px_rgba(0,40,32,0.35)] sm:flex-row sm:items-center">
        <label className="flex min-w-0 flex-1 items-center gap-3 px-4">
          <Search size={20} className="shrink-0 text-muted" />
          <span className="sr-only">CNPJ da agência</span>
          <input
            value={cnpj}
            onChange={(e) => setCnpj(mascaraCnpj(e.target.value))}
            inputMode="numeric"
            autoComplete="off"
            placeholder="00.000.000/0001-00"
            aria-invalid={!!erro}
            className="h-12 w-full min-w-0 bg-transparent font-mono text-[18px] tracking-[0.02em] text-ink outline-none placeholder:text-faint"
          />
        </label>
        <button type="submit" disabled={buscando || digitosCnpj(cnpj).length < 14} className="btn btn-dark btn-lg shrink-0">
          {buscando ? "Consultando..." : "Consultar"}
        </button>
      </div>
      {erro && <p className="mt-3 text-center text-[14px] text-danger">{erro}</p>}
    </form>
  );
}
