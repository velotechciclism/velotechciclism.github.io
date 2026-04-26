import React from "react";
import { Link } from "react-router-dom";
import { Bike, ShieldCheck, Wrench } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";

const About: React.FC = () => {
  const values = [
    {
      icon: Bike,
      title: "Equipamento para pedalar melhor",
      text: "Selecionamos produtos para deslocamento, treino, trilha e estrada com foco em confiança.",
    },
    {
      icon: ShieldCheck,
      title: "Compra clara e segura",
      text: "Preços, políticas e suporte pensados para o ciclista decidir sem pressa.",
    },
    {
      icon: Wrench,
      title: "Cultura de manutenção",
      text: "Guias e atendimento ajudam cada cliente a cuidar melhor do próprio conjunto.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-black">
        <section className="bg-secondary py-14">
          <div className="container mx-auto px-4">
            <h1 className="font-display text-4xl font-black text-secondary-foreground">
              Sobre a VeloTech
            </h1>
            <p className="mt-4 max-w-3xl text-lg text-secondary-foreground/70">
              A VeloTech nasceu para aproximar ciclistas de equipamentos confiáveis, informação simples e uma experiência de compra direta.
            </p>
          </div>
        </section>

        <section className="container mx-auto px-4 py-12">
          <div className="grid gap-6 md:grid-cols-3">
            {values.map((value) => (
              <div key={value.title} className="rounded-2xl border border-white/10 bg-muted p-6">
                <value.icon className="mb-4 h-8 w-8 text-primary" />
                <h2 className="font-display text-xl font-bold text-foreground">{value.title}</h2>
                <p className="mt-3 text-muted-foreground">{value.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-2xl border border-primary/25 bg-gradient-to-r from-primary/10 to-accent/10 p-8">
            <h2 className="font-display text-2xl font-bold text-foreground">
              Pronto para montar seu conjunto?
            </h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Explore o catálogo ou fale com a equipe para encontrar o equipamento ideal.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/products">
                <Button variant="yellow">Ver produtos</Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline">Falar conosco</Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;
