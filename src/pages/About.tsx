import React from "react";
import { Link } from "react-router-dom";
import { Bike, ShieldCheck, Wrench } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";

const About: React.FC = () => {
  const { language } = useLanguage();

  const values = [
    {
      icon: Bike,
      title: language === "pt-br" ? "Equipamento para pedalar melhor" : "Gear for better rides",
      text:
        language === "pt-br"
          ? "Selecionamos produtos para deslocamento, treino, trilha e estrada com foco em confianca."
          : "We select products for commuting, training, trail, and road riding with confidence in mind.",
    },
    {
      icon: ShieldCheck,
      title: language === "pt-br" ? "Compra clara e segura" : "Clear and secure shopping",
      text:
        language === "pt-br"
          ? "Precos, politicas e suporte pensados para o ciclista decidir sem pressa."
          : "Prices, policies, and support designed to help riders decide without pressure.",
    },
    {
      icon: Wrench,
      title: language === "pt-br" ? "Cultura de manutencao" : "Maintenance culture",
      text:
        language === "pt-br"
          ? "Guias e atendimento ajudam cada cliente a cuidar melhor do proprio setup."
          : "Guides and support help every customer take better care of their setup.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-green-950/95">
        <section className="bg-secondary py-14">
          <div className="container mx-auto px-4">
            <h1 className="font-display text-4xl font-black text-secondary-foreground">
              {language === "pt-br" ? "Sobre a VeloTech" : "About VeloTech"}
            </h1>
            <p className="mt-4 max-w-3xl text-lg text-secondary-foreground/70">
              {language === "pt-br"
                ? "A VeloTech nasceu para aproximar ciclistas de equipamentos confiaveis, informacao simples e uma experiencia de compra direta."
                : "VeloTech was created to connect riders with reliable gear, simple information, and a direct shopping experience."}
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
              {language === "pt-br" ? "Pronto para montar seu setup?" : "Ready to build your setup?"}
            </h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              {language === "pt-br"
                ? "Explore o catalogo ou fale com a equipe para encontrar o equipamento ideal."
                : "Explore the catalog or contact the team to find the right equipment."}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/products">
                <Button variant="yellow">{language === "pt-br" ? "Ver produtos" : "View products"}</Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline">{language === "pt-br" ? "Falar conosco" : "Contact us"}</Button>
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
