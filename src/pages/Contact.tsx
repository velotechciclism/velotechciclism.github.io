import React, { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, Send, Clock, MessageCircle } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const Contact: React.FC = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    // Reset form after 3 seconds
    setTimeout(() => {
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
      setSubmitted(false);
    }, 3000);
  };

  const contactMethods = [
    {
      icon: Phone,
      title: t("contact.phone"),
      details: t("contact.phoneDetails"),
      description: t("contact.phoneHours"),
      link: "tel:+351210123456",
    },
    {
      icon: Mail,
      title: t("contact.email"),
      details: t("contact.emailDetails"),
      description: t("contact.emailHours"),
      link: "mailto:c.eduardoteixeiraguinsber@gmail.com",
    },
    {
      icon: MessageCircle,
      title: t("contact.whatsapp"),
      details: t("contact.whatsappDetails"),
      description: t("contact.whatsappHours"),
      link: "https://wa.me/351966601839",
    },
    {
      icon: MapPin,
      title: t("contact.address"),
      details: t("contact.addressDetails"),
      description: t("contact.addressType"),
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-background">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {contactMethods.map((method, index) => (
              <a
                key={method.title}
                href={method.link}
                target={method.link && method.link.startsWith("http") ? "_blank" : undefined}
                rel={method.link && method.link.startsWith("http") ? "noopener noreferrer" : undefined}
                className="rounded-2xl bg-muted p-6 hover:shadow-lg hover:bg-muted/80 transition-all duration-300 animate-fade-in cursor-pointer"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <method.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display font-bold text-foreground mb-2">
                  {method.title}
                </h3>
                <p className="font-semibold text-foreground mb-1">
                  {method.details}
                </p>
                <p className="text-sm text-muted-foreground">{method.description}</p>
              </a>
            ))}
          </div>

          {/* Contact Form */}
          <div className="max-w-2xl mx-auto rounded-2xl bg-muted p-8 sm:p-12">
            <h2 className="font-display text-2xl font-bold text-foreground mb-6">
              {t("contact.sendMessage")}
            </h2>

            {submitted ? (
              <div className="rounded-lg bg-green-50 dark:bg-green-950 p-6 border border-green-200 dark:border-green-800">
                <p className="text-green-800 dark:text-green-200 font-semibold">
                  {t("contact.thankYou")}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      {t("contact.name")}
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder={t("common.name")}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      {t("contact.email")}
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="seu@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {t("contact.subject")}
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder={t("contact.subject")}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {t("contact.message")}
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder={t("contact.message")}
                  />
                </div>

                <Button type="submit" className="w-full group">
                  <Send className="w-4 h-4 mr-2 group-hover:-translate-y-1 transition-transform" />
                  {t("contact.send")}
                </Button>
              </form>
            )}
          </div>
        </div>

        {/* Map Section (Placeholder) */}
        <div className="bg-muted py-12 mt-12">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-2xl font-bold text-foreground mb-8 text-center">
              {t("contact.findUs")}
            </h2>
            <div className="rounded-2xl overflow-hidden h-96 bg-background border border-border flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-16 h-16 text-primary/30 mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {t("contact.mapComingSoon")}
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

export default Contact;
