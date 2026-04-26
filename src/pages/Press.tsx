import React from "react";
import { Link } from "react-router-dom";
import { Mail, Newspaper, Radio } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";

const Press: React.FC = () => {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-black">
        <section className="bg-secondary py-14">
          <div className="container mx-auto px-4">
            <h1 className="font-display text-4xl font-black text-secondary-foreground">
              {language === "pt-br" ? "Imprensa" : "Press"}
            </h1>
            <p className="mt-4 max-w-3xl text-lg text-secondary-foreground/70">
              {language === "pt-br"
                ? "Informacoes institucionais, contatos e pautas sobre a VeloTech."
                : "Company information, contacts, and story angles about VeloTech."}
            </p>
          </div>
        </section>

        <section className="container mx-auto px-4 py-12">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-muted p-6">
              <Newspaper className="mb-4 h-8 w-8 text-primary" />
              <h2 className="font-display text-xl font-bold text-foreground">
                {language === "pt-br" ? "Resumo" : "Overview"}
              </h2>
              <p className="mt-3 text-muted-foreground">
                {language === "pt-br"
                  ? "A VeloTech e uma plataforma de e-commerce focada em equipamentos de ciclismo, conteudo e suporte ao cliente."
                  : "VeloTech is an e-commerce platform focused on cycling equipment, content, and customer support."}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-muted p-6">
              <Radio className="mb-4 h-8 w-8 text-primary" />
              <h2 className="font-display text-xl font-bold text-foreground">
                {language === "pt-br" ? "Pautas" : "Story angles"}
              </h2>
              <p className="mt-3 text-muted-foreground">
                {language === "pt-br"
                  ? "Mobilidade urbana, seguranca no pedal, tecnologia esportiva e consumo consciente."
                  : "Urban mobility, cycling safety, sports technology, and conscious shopping."}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-muted p-6">
              <Mail className="mb-4 h-8 w-8 text-primary" />
              <h2 className="font-display text-xl font-bold text-foreground">
                {language === "pt-br" ? "Contato" : "Contact"}
              </h2>
              <p className="mt-3 text-muted-foreground">
                c.eduardoteixeiraguinsber@gmail.com
              </p>
            </div>
          </div>

          <div className="mt-10 rounded-2xl border border-primary/25 bg-gradient-to-r from-primary/10 to-accent/10 p-8">
            <h2 className="font-display text-2xl font-bold text-foreground">
              {language === "pt-br" ? "Precisa falar com a VeloTech?" : "Need to reach VeloTech?"}
            </h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              {language === "pt-br"
                ? "Use o formulario de contato para pedidos de entrevista, materiais ou informacoes adicionais."
                : "Use the contact form for interviews, materials, or additional information."}
            </p>
            <Link to="/contact" className="mt-6 inline-flex">
              <Button variant="yellow">{language === "pt-br" ? "Abrir contato" : "Open contact"}</Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Press;
