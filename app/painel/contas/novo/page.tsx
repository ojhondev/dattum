import { CONTA_VAZIA, FormConta } from "@/components/app/FormConta";

export default function NovaContaPage() {
  return (
    <div>
      <p className="painel-eyebrow">Dattis · Nova conta</p>
      <h1 className="painel-title">Ativar conta nova</h1>
      <p className="painel-lede">
        Preencha os dados do cliente e marque o que ele usa. A Dattis gera na hora o registro do que vocês fazem com o dado dele, o
        contrato entre vocês e a lista de ferramentas que tocam esse dado.
      </p>
      <FormConta inicial={CONTA_VAZIA} />
    </div>
  );
}
