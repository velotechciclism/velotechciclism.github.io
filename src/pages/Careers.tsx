import React from "react";
import { Link } from "react-router-dom";
import { Briefcase, HeartHandshake, MapPin } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";

const Careers: React.FC = () => {
  const { language } = useLanguage();

  const roles = [
    language === "pt-br" ? "Especialista em atendimento ao ciclista" : "Rider support specialist",
    language === "pt-br" ? "Curador de catalogo e marcas" : "Catalog and brand curator",
    language === "pt-br" ? "Conteudo e comunidade" : "Content and community",
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-black">
        <section className="bg-secondary py-14">
          <div className="container mx-auto px-4">
            <h1 className="font-display text-4xl font-black text-secondary-foreground">
              {language === "pt-br" ? "Carreiras" : "Careers"}
            </h1>
            <p className="mt-4 max-w-3xl text-lg text-secondary-foreground/70">
              {language === "pt-br"
                ? "Quer ajudar ciclistas a comprarem melhor? A VeloTech combina produto, suporte e cultura de pedal."
                : "Want to help riders buy better? VeloTech combines product, support, and cycling culture."}
            </p>
          </div>
        </section>

        <section className="container mx-auto px-4 py-12">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-muted p-6">
              <Briefcase className="mb-4 h-8 w-8 text-primary" />
              <h2 className="font-display text-xl font-bold text-foreground">
                {language === "pt-br" ? "Areas abertas" : "Open areas"}
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
                {language === "pt-br" ? "Como trabalhamos" : "How we work"}
              </h2>
              <p className="mt-4 text-muted-foreground">
                {language === "pt-br"
                  ? "Valorizamos clareza, responsabilidade e vontade de aprender com clientes reais."
                  : "We value clarity, ownership, and willingness to learn from real customers."}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-muted p-6">
              <MapPin className="mb-4 h-8 w-8 text-primary" />
              <h2 className="font-display text-xl font-bold text-foreground">
                {language === "pt-br" ? "Localizacao" : "Location"}
              </h2>
              <p className="mt-4 text-muted-foreground">
                {language === "pt-br"
                  ? "Base em Lisboa com colaboracao remota para conteudo, suporte e operacoes digitais."
                  : "Lisbon based with remote collaboration for content, support, and digital operations."}
              </p>
            </div>
          </div>

          <div className="mt-10 rounded-2xl border border-primary/25 bg-muted p-8 text-center">
            <h2 className="font-display text-2xl font-bold text-foreground">
              {language === "pt-br" ? "Envie sua candidatura" : "Send your application"}
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
              {language === "pt-br"
                ? "Conte sua experiencia com ciclismo, atendimento ou tecnologia. Vamos responder pelo canal de contato."
                : "Tell us about your experience with cycling, support, or technology. We will reply through our contact channel."}
            </p>
            <Link to="/contact" className="mt-6 inline-flex">
              <Button variant="yellow">{language === "pt-br" ? "Entrar em contato" : "Contact us"}</Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Careers;
