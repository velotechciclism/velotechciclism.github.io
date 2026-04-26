import React from "react";
import { Link } from "react-router-dom";
import { Briefcase, HeartHandshake, MapPin } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";

const Careers: React.FC = () => {
  const roles = [
    "Especialista em atendimento ao ciclista",
    "Curador de catálogo e marcas",
    "Conteúdo e comunidade",
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-black">
        <section className="bg-secondary py-14">
          <div className="container mx-auto px-4">
            <h1 className="font-display text-4xl font-black text-secondary-foreground">
              Carreiras
            </h1>
            <p className="mt-4 max-w-3xl text-lg text-secondary-foreground/70">
              Quer ajudar ciclistas a comprarem melhor? A VeloTech combina produto, suporte e cultura de pedal.
            </p>
          </div>
        </section>

        <section className="container mx-auto px-4 py-12">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-muted p-6">
              <Briefcase className="mb-4 h-8 w-8 text-primary" />
              <h2 className="font-display text-xl font-bold text-foreground">
                Áreas abertas
              </h2>
              <ul className="mt-4 space-y-2 text-muted-foreground">
                {roles.map((role) => (
                  <li key={role}>{role}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-white/10 bg-muted p-6">
              <HeartHandshake className="mb-4 h-8 w-8 text-primary" />
              <h2 className="font-display text-xl font-bold text-foreground">
                Como trabalhamos
              </h2>
              <p className="mt-4 text-muted-foreground">
                Valorizamos clareza, responsabilidade e vontade de aprender com clientes reais.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-muted p-6">
              <MapPin className="mb-4 h-8 w-8 text-primary" />
              <h2 className="font-display text-xl font-bold text-foreground">
                Localização
              </h2>
              <p className="mt-4 text-muted-foreground">
                Base em Lisboa com colaboração remota para conteúdo, suporte e operações digitais.
              </p>
            </div>
          </div>

          <div className="mt-10 rounded-2xl border border-primary/25 bg-muted p-8 text-center">
            <h2 className="font-display text-2xl font-bold text-foreground">
              Envie sua candidatura
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
              Conte sua experiência com ciclismo, atendimento ou tecnologia. Vamos responder pelo canal de contato.
            </p>
            <Link to="/contact" className="mt-6 inline-flex">
              <Button variant="yellow">Entrar em contato</Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Careers;
