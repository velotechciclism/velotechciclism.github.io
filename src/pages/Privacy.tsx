import React from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const Privacy: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-background">
        <div className="bg-secondary py-12">
          <div className="container mx-auto px-4">
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-secondary-foreground mb-2">
              Política de Privacidade
            </h1>
            <p className="text-secondary-foreground/70">
              Saiba como tratamos e protegemos os seus dados pessoais.
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <div className="rounded-2xl border border-border bg-card p-8 space-y-5">
            <p className="text-muted-foreground">
              A VeloTech coleta apenas os dados necessários para operar o site, processar pedidos e oferecer suporte.
            </p>
            <p className="text-muted-foreground">
              Os dados de cadastro e compra podem incluir nome, e-mail, telefone, endereco e historico de pedidos.
            </p>
            <p className="text-muted-foreground">
              Nao vendemos dados pessoais. As informacoes sao usadas exclusivamente para operacao, seguranca e melhoria da experiencia.
            </p>
            <p className="text-muted-foreground">
              Voce pode solicitar atualizacao, correcao ou remocao de dados pelo e-mail oficial de contato.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Privacy;
