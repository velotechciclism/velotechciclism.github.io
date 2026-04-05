import React, { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Search, MessageCircle, HelpCircle } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const Help: React.FC = () => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");

  const faqItems: FAQItem[] = [
    {
      id: "1",
      category: t("help.orders"),
      question: t("help.faqItems.trackOrder.question"),
      answer: t("help.faqItems.trackOrder.answer"),
    },
    {
      id: "2",
      category: t("help.orders"),
      question: t("help.faqItems.internationalShipping.question"),
      answer: t("help.faqItems.internationalShipping.answer"),
    },
    {
      id: "3",
      category: t("help.returns"),
      question: t("help.faqItems.returnPolicy.question"),
      answer: t("help.faqItems.returnPolicy.answer"),
    },
    {
      id: "4",
      category: t("help.returns"),
      question: t("help.faqItems.refundTime.question"),
      answer: t("help.faqItems.refundTime.answer"),
    },
    {
      id: "5",
      category: t("help.payment"),
      question: t("help.faqItems.paymentMethods.question"),
      answer: t("help.faqItems.paymentMethods.answer"),
    },
    {
      id: "6",
      category: t("help.payment"),
      question: t("help.faqItems.paymentSecurity.question"),
      answer: t("help.faqItems.paymentSecurity.answer"),
    },
    {
      id: "7",
      category: t("help.products"),
      question: t("help.faqItems.bikeSize.question"),
      answer: t("help.faqItems.bikeSize.answer"),
    },
    {
      id: "8",
      category: t("help.products"),
      question: t("help.faqItems.assemblyServices.question"),
      answer: t("help.faqItems.assemblyServices.answer"),
    },
    {
      id: "9",
      category: t("help.warranty"),
      question: t("help.faqItems.warrantyInfo.question"),
      answer: t("help.faqItems.warrantyInfo.answer"),
    },
    {
      id: "10",
      category: t("help.account"),
      question: t("help.faqItems.createAccount.question"),
      answer: t("help.faqItems.createAccount.answer"),
    },
  ];

  const filteredFAQ = faqItems.filter(
    (item) =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories = Array.from(new Set(faqItems.map((item) => item.category)));

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-background">
        {/* Page Header */}
        <div className="bg-secondary py-12">
          <div className="container mx-auto px-4">
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-secondary-foreground mb-2">
              {t("help.title")}
            </h1>
            <p className="text-secondary-foreground/70">
              {t("help.subtitle")}
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder={t("help.searchForHelp")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-lg bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16">
            <div className="rounded-2xl bg-muted p-6 text-center hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display font-bold text-foreground mb-2">
                {t("help.liveChat")}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {t("help.liveChatDesc")}
              </p>
              <Button variant="outline" className="w-full">
                {t("help.startChat")}
              </Button>
            </div>

            <div className="rounded-2xl bg-muted p-6 text-center hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <HelpCircle className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display font-bold text-foreground mb-2">
                {t("help.emailSupport")}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                support@velotech.com
              </p>
              <Button variant="outline" className="w-full">
                {t("help.sendEmail")}
              </Button>
            </div>

            <div className="rounded-2xl bg-muted p-6 text-center hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Search className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display font-bold text-foreground mb-2">
                {t("help.guides")}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {t("help.guidesDesc")}
              </p>
              <Button variant="outline" className="w-full">
                {t("help.browseGuides")}
              </Button>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display text-2xl font-bold text-foreground mb-8">
              {t("help.faq")}
            </h2>

            {/* Category Tabs */}
            <div className="flex flex-wrap gap-2 mb-8">
              <Button
                variant={searchQuery === "" ? "default" : "outline"}
                onClick={() => setSearchQuery("")}
              >
                {t("common.all")}
              </Button>
              {categories.map((category) => (
                <Button
                  key={category}
                  variant="outline"
                  onClick={() => setSearchQuery(category)}
                >
                  {category}
                </Button>
              ))}
            </div>

            {/* Accordion */}
            {filteredFAQ.length > 0 ? (
              <Accordion type="single" collapsible className="w-full">
                {filteredFAQ.map((item) => (
                  <AccordionItem key={item.id} value={item.id}>
                    <AccordionTrigger className="text-left hover:no-underline">
                      <div className="flex items-start gap-3 w-full">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-semibold flex-shrink-0 mt-0.5">
                          ?
                        </span>
                        <span className="font-medium text-foreground">
                          {item.question}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pl-9 text-muted-foreground">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <div className="text-center py-12 rounded-lg bg-muted">
                <p className="text-muted-foreground mb-4">
                  {t("help.noResultsFor")} "{searchQuery}"
                </p>
                <Button
                  variant="outline"
                  onClick={() => setSearchQuery("")}
                >
                  {t("common.clearSearch")}
                </Button>
              </div>
            )}
          </div>

          {/* Contact Section */}
          <div className="mt-16 rounded-2xl bg-gradient-to-r from-primary/10 to-accent/10 p-8 sm:p-12 text-center border border-primary/20">
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">
              {t("help.didntFind")}
            </h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              {t("help.didntFindDesc")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button>{t("help.contactSupport")}</Button>
              <Button variant="outline">{t("help.browseBlog")}</Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Help;