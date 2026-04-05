import React from "react";
import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter, Youtube, Mail, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/context/LanguageContext";
import logo from "@/assets/logo.png";

const Footer: React.FC = () => {
  const { t, language } = useLanguage();
  const footerLinks = {
    shop: [
      { name: t("home.categories.bikes"), href: "/products?category=bicycles" },
      { name: t("home.categories.helmets"), href: "/products?category=helmets" },
      { name: t("home.categories.clothing"), href: "/products?category=apparel" },
      { name: t("home.categories.accessories"), href: "/products?category=accessories" },
      { name: t("home.categories.parts"), href: "/products?category=parts" },
    ],
    support: [
      { name: t("common.help"), href: "/help" },
      { name: t("footer.support"), href: "/shipping" },
      { name: t("footer.returns"), href: "/returns" },
      { name: t("footer.trackOrder"), href: "/track-order" },
      { name: t("common.contact"), href: "/contact" },
    ],
    company: [
      { name: t("footer.about"), href: "/about" },
      { name: t("common.blog"), href: "/blog" },
      { name: t("footer.careers"), href: "/careers" },
      { name: t("footer.press"), href: "/press" },
    ],
    legal: [
      { name: t("footer.privacy"), href: "/privacy" },
      { name: t("footer.terms"), href: "/terms" },
      { name: t("footer.cookiePolicy"), href: "/cookies" },
    ],
  };

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Youtube, href: "#", label: "YouTube" },
  ];

  return (
    <footer className="bg-secondary text-secondary-foreground">
      {/* Newsletter Section */}
      <div className="border-b border-white/10">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="font-display text-2xl font-bold mb-2">
              {t("footer.newsletterTitle")}
            </h3>
            <p className="text-secondary-foreground/70 mb-6">
              {t("footer.newsletterSubtitle")}
            </p>
            <form className="flex gap-2 max-w-md mx-auto">
              <Input
                type="email"
                placeholder={t("footer.emailPlaceholder")}
                className="bg-white/10 border-white/20 text-secondary-foreground placeholder:text-secondary-foreground/50"
              />
              <Button variant="yellow" type="submit">
                <Mail className="w-4 h-4 mr-2" />
                {t("common.subscribe")}
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <Link to="/" className="inline-block mb-4">
              <img
                src={logo}
                alt="VeloTech"
                className="h-16 w-auto object-contain"
              />
            </Link>
            <p className="text-secondary-foreground/70 mb-6 max-w-sm">
              {t("footer.brandDescription")}
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-display font-semibold mb-4">{t("common.products")}</h4>
            <ul className="space-y-2">
              {footerLinks.shop.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-secondary-foreground/70 hover:text-accent transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-display font-semibold mb-4">{t("footer.support")}</h4>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-secondary-foreground/70 hover:text-accent transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-display font-semibold mb-4">{t("footer.company")}</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-secondary-foreground/70 hover:text-accent transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-display font-semibold mb-4">{t("footer.legal")}</h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-secondary-foreground/70 hover:text-accent transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-secondary-foreground/50">
            <div className="flex flex-col sm:flex-row items-center gap-2 text-center">
              <p>{t("footer.copyright")}</p>
              <span className="hidden sm:inline">|</span>
              <p>{t("footer.developedBy")} Carlos Santos | Escola Secundária Henriques Nogueira</p>
            </div>
            <div className="flex gap-4">
              <span>{language === "pt-br" ? "🇧🇷" : "🇺🇸"} {language === "pt-br" ? t("footer.portuguese") : t("footer.english")}</span>
              <span>€ EUR</span>
            </div>
          </div>
        </div>
      </div>

      {/* WhatsApp Button */}
      <a
        href="https://wa.me/5571912345678"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110"
        aria-label="WhatsApp"
      >
        <MessageCircle className="w-7 h-7" />
      </a>
    </footer>
  );
};

export default Footer;
