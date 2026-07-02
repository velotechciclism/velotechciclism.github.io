import React from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Mail, Phone, MapPin, MessageCircle } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { contactInfo } from "@/config/contact";

const Contact: React.FC = () => {
  const { t } = useLanguage();

  const contactMethods = [
    {
      icon: Phone,
      title: t("contact.phone"),
      details: contactInfo.phone.number,
      description: t("contact.phoneHours"),
      link: contactInfo.phone.link,
    },
    {
      icon: Mail,
      title: t("contact.email"),
      details: contactInfo.email.address,
      description: t("contact.emailHours"),
      link: contactInfo.email.link,
    },
    {
      icon: MessageCircle,
      title: t("contact.whatsapp"),
      details: contactInfo.whatsapp.display,
      description: t("contact.whatsappHours"),
      link: contactInfo.whatsapp.link,
    },
    {
      icon: MapPin,
      title: t("contact.address"),
      details: contactInfo.address.display,
      description: t("contact.addressType"),
    },
  ];

  const cardClassName =
    "min-w-0 rounded-2xl bg-muted p-6 hover:shadow-lg hover:bg-muted/80 transition-all duration-300 animate-fade-in";

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-black">
        {/* Page Header */}
        <div className="bg-secondary py-12">
          <div className="container mx-auto px-4">
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-secondary-foreground mb-2">
              {t("contact.title")}
            </h1>
            <p className="text-secondary-foreground/70">
              {t("contact.subtitle")}
            </p>
          </div>
        </div>

        {/* Contact Methods */}
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactMethods.map((method, index) => (
              method.link ? (
                <a
                  key={method.title}
                  href={method.link}
                  target={method.link.startsWith("http") ? "_blank" : undefined}
                  rel={method.link.startsWith("http") ? "noopener noreferrer" : undefined}
                  className={`${cardClassName} cursor-pointer`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <method.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-display font-bold text-foreground mb-2">
                    {method.title}
                  </h3>
                  <p className="font-semibold text-foreground mb-1 break-words [overflow-wrap:anywhere]">
                    {method.details}
                  </p>
                  <p className="text-sm text-muted-foreground">{method.description}</p>
                </a>
              ) : (
                <div
                  key={method.title}
                  className={cardClassName}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <method.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-display font-bold text-foreground mb-2">
                    {method.title}
                  </h3>
                  <p className="font-semibold text-foreground mb-1 break-words [overflow-wrap:anywhere]">
                    {method.details}
                  </p>
                  <p className="text-sm text-muted-foreground">{method.description}</p>
                </div>
              )
            ))}
          </div>
        </div>

      </main>
      <Footer />
    </div>
  );
};

export default Contact;
