import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Percent, Truck, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";

const PromoSection: React.FC = () => {
  const { t } = useLanguage();
  
  const features = [
    {
      icon: Truck,
      title: t("home.promo.features.freeShipping"),
      description: t("home.promo.features.freeShippingDesc"),
    },
    {
      icon: Shield,
      title: t("home.promo.features.warranty"),
      description: t("home.promo.features.warrantyDesc"),
    },
    {
      icon: Percent,
      title: t("home.promo.features.memberDiscounts"),
      description: t("home.promo.features.memberDiscountsDesc"),
    },
  ];

  return (
    <section className="py-20 bg-muted">
      <div className="container mx-auto px-4">
        {/* Promo Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-secondary p-8 md:p-12 mb-12">
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 max-w-2xl">
            <span className="inline-block px-4 py-1 rounded-full bg-accent text-accent-foreground text-sm font-semibold mb-4">
              {t("home.promo.limitedOffer")}
            </span>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-secondary-foreground mb-4">
              {t("home.promo.summerSale")}
              <span className="block text-accent">{t("home.promo.upTo40Off")}</span>
            </h2>
            <p className="text-secondary-foreground/70 mb-8 max-w-lg">
              {t("home.promo.summerDescription")}
            </p>
            <Link to="/products">
              <Button variant="hero" size="lg">
                {t("home.promo.shopTheSale")}
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="flex items-center gap-4 p-6 rounded-2xl bg-background border border-border animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <feature.icon className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PromoSection;
