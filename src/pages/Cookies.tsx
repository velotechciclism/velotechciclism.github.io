import React from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const Cookies: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-background">
        <div className="bg-secondary py-12">
          <div className="container mx-auto px-4">
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-secondary-foreground mb-2">
              Política de Cookies
            </h1>
            <p className="text-secondary-foreground/70">
              Entenda como os cookies sao utilizados para desempenho e experiencia.
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <div className="rounded-2xl border border-border bg-card p-8 space-y-5">
            <p className="text-muted-foreground">
              Utilizamos cookies para manter sessao ativa, lembrar preferencias e melhorar navegacao.
            </p>
            <p className="text-muted-foreground">
              Alguns cookies sao essenciais para funcionamento de login, carrinho e historico de pedidos.
            </p>
            <p className="text-muted-foreground">
              Voce pode desativar cookies no navegador, mas algumas funcionalidades podem ficar limitadas.
            </p>
            <p className="text-muted-foreground">
              Ao continuar navegando, voce concorda com o uso de cookies descrito nesta politica.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Cookies;
