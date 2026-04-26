import React from "react";
import { Link } from "react-router-dom";
import { Mail, Newspaper, Radio } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";

const Press: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-black">
        <section className="bg-secondary py-14">
          <div className="container mx-auto px-4">
            <h1 className="font-display text-4xl font-black text-secondary-foreground">
              Imprensa
            </h1>
            <p className="mt-4 max-w-3xl text-lg text-secondary-foreground/70">
              Informações institucionais, contatos e pautas sobre a VeloTech.
            </p>
          </div>
        </section>

        <section className="container mx-auto px-4 py-12">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-muted p-6">
              <Newspaper className="mb-4 h-8 w-8 text-primary" />
              <h2 className="font-display text-xl font-bold text-foreground">
                Resumo
              </h2>
              <p className="mt-3 text-muted-foreground">
                A VeloTech é uma plataforma de comércio eletrônico focada em equipamentos de ciclismo, conteúdo e suporte ao cliente.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-muted p-6">
              <Radio className="mb-4 h-8 w-8 text-primary" />
              <h2 className="font-display text-xl font-bold text-foreground">
                Pautas
              </h2>
              <p className="mt-3 text-muted-foreground">
                Mobilidade urbana, segurança no pedal, tecnologia esportiva e consumo consciente.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-muted p-6">
              <Mail className="mb-4 h-8 w-8 text-primary" />
              <h2 className="font-display text-xl font-bold text-foreground">
                Contato
              </h2>
              <p className="mt-3 text-muted-foreground">
                c.eduardoteixeiraguinsber@gmail.com
              </p>
            </div>
          </div>

          <div className="mt-10 rounded-2xl border border-primary/25 bg-gradient-to-r from-primary/10 to-accent/10 p-8">
            <h2 className="font-display text-2xl font-bold text-foreground">
              Precisa falar com a VeloTech?
            </h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Use o formulário de contato para pedidos de entrevista, materiais ou informações adicionais.
            </p>
            <Link to="/contact" className="mt-6 inline-flex">
              <Button variant="yellow">Abrir contato</Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Press;
