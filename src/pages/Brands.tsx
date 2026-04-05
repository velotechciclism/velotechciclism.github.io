import React from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { brandsData } from "@/data/brands";
import { useLanguage } from "@/context/LanguageContext";

const Brands: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-background">
        {/* Page Header */}
        <div className="bg-secondary py-12">
          <div className="container mx-auto px-4">
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-secondary-foreground mb-2">
              {t("brands.title")}
            </h1>
            <p className="text-secondary-foreground/70">
              {t("brands.subtitle")}
            </p>
          </div>
        </div>

        {/* Brands Grid */}
        <div className="container mx-auto px-4 py-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {brandsData.map((brand, index) => (
              <div
                key={brand.id}
                className="group relative rounded-2xl bg-muted p-8 hover:shadow-lg transition-all duration-300 animate-fade-in overflow-hidden"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-center justify-center h-40 mb-6 bg-white/5 rounded-xl group-hover:bg-white/10 transition-colors">
                  <img
                    src={brand.logo}
                    alt={brand.name}
                    className="max-h-32 max-w-full object-contain group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
                <h3 className="font-display text-lg font-bold text-foreground mb-4">
                  {brand.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {brand.description}
                </p>
                <Link to={`/products?brand=${brand.name}`}>
                  <Button variant="outline" className="w-full group">
                    {t("brands.shop")} {brand.name}
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Featured Brands Section */}
        <div className="bg-muted py-20">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground text-center mb-12">
              {t("brands.whyChoose")}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🏆</span>
                </div>
                <h3 className="font-display font-bold text-foreground mb-2">
                  {t("brands.industryLeaders")}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {t("brands.industryLeadersDesc")}
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">✅</span>
                </div>
                <h3 className="font-display font-bold text-foreground mb-2">
                  {t("brands.qualityGuaranteed")}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {t("brands.qualityGuaranteedDesc")}
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💯</span>
                </div>
                <h3 className="font-display font-bold text-foreground mb-2">
                  {t("brands.bestPrices")}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {t("brands.bestPricesDesc")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Brands;