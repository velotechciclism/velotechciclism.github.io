import React from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const Terms: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-background">
        <div className="bg-secondary py-12">
          <div className="container mx-auto px-4">
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-secondary-foreground mb-2">
              Termos de Uso
            </h1>
            <p className="text-secondary-foreground/70">
              Regras para uso da plataforma, compras e relacionamento com a loja.
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <div className="rounded-2xl border border-border bg-card p-8 space-y-5">
            <p className="text-muted-foreground">
              Ao utilizar a VeloTech, voce concorda com os termos descritos nesta pagina.
            </p>
            <p className="text-muted-foreground">
              Produtos, precos e disponibilidade podem ser alterados sem aviso previo, sempre respeitando pedidos ja confirmados.
            </p>
            <p className="text-muted-foreground">
              O usuario e responsavel pela veracidade das informacoes de cadastro e pelo uso adequado da conta.
            </p>
            <p className="text-muted-foreground">
              Em caso de fraude, uso indevido ou violacao de regras, a conta pode ser bloqueada para seguranca da plataforma.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Terms;
