import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import heroImage from "@/assets/hero-cycling.jpg";

const HeroSection: React.FC = () => {
  const { t } = useLanguage();
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Cyclist riding on mountain road"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-secondary/95 via-secondary/70 to-transparent" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 backdrop-blur-sm border border-accent/30 mb-6 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-sm font-medium text-accent">
              {t("home.hero.badge")}
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-display text-4xl sm:text-5xl lg:text-7xl font-bold text-secondary-foreground leading-tight mb-6 animate-slide-up">
            {t("home.hero.title")}
            <span className="block text-accent">{t("home.hero.cta")}</span>
          </h1>

          {/* Description */}
          <p
            className="text-lg text-secondary-foreground/80 mb-8 max-w-lg animate-slide-up"
            style={{ animationDelay: "0.1s" }}
          >
            {t("home.hero.subtitle")}
          </p>

          {/* CTAs */}
          <div
            className="flex flex-wrap gap-4 animate-slide-up"
            style={{ animationDelay: "0.2s" }}
          >
            <Link to="/products">
              <Button variant="hero" size="xl">
                {t("home.hero.shopNow")}
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Button variant="heroOutline" size="xl">
              <Play className="w-5 h-5" />
              {t("home.hero.watchVideo")}
            </Button>
          </div>

          {/* Stats */}
          <div
            className="grid grid-cols-3 gap-8 mt-12 pt-8 border-t border-white/20 animate-slide-up"
            style={{ animationDelay: "0.3s" }}
          >
            <div>
              <div className="font-display text-3xl font-bold text-accent">
                500+
              </div>
              <div className="text-sm text-secondary-foreground/60">
                {t("home.hero.stats.products")}
              </div>
            </div>
            <div>
              <div className="font-display text-3xl font-bold text-accent">
                50K+
              </div>
              <div className="text-sm text-secondary-foreground/60">
                {t("home.hero.stats.cyclists")}
              </div>
            </div>
            <div>
              <div className="font-display text-3xl font-bold text-accent">
                24/7
              </div>
              <div className="text-sm text-secondary-foreground/60">
                {t("home.hero.stats.support")}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-float">
        <span className="text-xs text-secondary-foreground/50 uppercase tracking-wider">
          {t("common.scroll")}
        </span>
        <div className="w-6 h-10 rounded-full border-2 border-secondary-foreground/30 flex items-start justify-center p-2">
          <div className="w-1.5 h-3 rounded-full bg-accent animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
