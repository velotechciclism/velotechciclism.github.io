import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { Percent, Ticket } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/product/ProductCard";
import { Button } from "@/components/ui/button";
import { products } from "@/data/products";
import { useLanguage } from "@/context/LanguageContext";

const Offers: React.FC = () => {
  const { language } = useLanguage();
  const discountedProducts = useMemo(
    () => products.filter((product) => product.originalPrice && product.originalPrice > product.price),
    []
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-black">
        <section className="bg-secondary py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-sm font-semibold text-primary">
                <Percent className="h-4 w-4" />
                {language === "pt-br" ? "Ofertas ativas" : "Active offers"}
              </span>
              <h1 className="mt-5 font-display text-4xl font-black text-secondary-foreground">
                {language === "pt-br" ? "Promocoes VeloTech" : "VeloTech Deals"}
              </h1>
              <p className="mt-3 text-secondary-foreground/70">
                {language === "pt-br"
                  ? "Produtos selecionados com desconto e cupoes para finalizar sua compra."
                  : "Selected discounted products and coupons to complete your order."}
              </p>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-12">
          <div className="mb-10 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-primary/25 bg-muted p-6">
              <Ticket className="mb-4 h-8 w-8 text-primary" />
              <h2 className="font-display text-xl font-bold text-foreground">VELO10</h2>
              <p className="mt-2 text-muted-foreground">
                {language === "pt-br"
                  ? "10% de desconto no subtotal do carrinho."
                  : "10% off the cart subtotal."}
              </p>
            </div>
            <div className="rounded-2xl border border-primary/25 bg-muted p-6">
              <Ticket className="mb-4 h-8 w-8 text-primary" />
              <h2 className="font-display text-xl font-bold text-foreground">BIKE15</h2>
              <p className="mt-2 text-muted-foreground">
                {language === "pt-br"
                  ? "15% em compras acima de EUR 100."
                  : "15% off orders over EUR 100."}
              </p>
            </div>
          </div>

          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-display text-2xl font-bold text-secondary-foreground">
              {language === "pt-br" ? "Produtos em promocao" : "Discounted products"}
            </h2>
            <Link to="/products">
              <Button variant="outline">
                {language === "pt-br" ? "Ver tudo" : "View all"}
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {discountedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Offers;
