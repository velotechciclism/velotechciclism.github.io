import React from "react";
import { Star, Quote } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const TestimonialsSection: React.FC = () => {
  const { t } = useLanguage();
  
  const testimonials = [
    {
      id: 1,
      name: t("home.testimonials.testimonial1.name"),
      role: t("home.testimonials.testimonial1.role"),
      avatar: "SJ",
      rating: 5,
      content: t("home.testimonials.testimonial1.content"),
    },
    {
      id: 2,
      name: t("home.testimonials.testimonial2.name"),
      role: t("home.testimonials.testimonial2.role"),
      avatar: "MC",
      rating: 5,
      content: t("home.testimonials.testimonial2.content"),
    },
    {
      id: 3,
      name: t("home.testimonials.testimonial3.name"),
      role: t("home.testimonials.testimonial3.role"),
      avatar: "EW",
      rating: 5,
      content: t("home.testimonials.testimonial3.content"),
    },
  ];

  return (
    <section className="py-20 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
            {t("home.testimonials.title")}
          </h2>
          <p className="text-primary-foreground/70 max-w-2xl mx-auto">
            {t("home.testimonials.subtitle")}
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className="relative bg-primary-foreground/10 backdrop-blur-sm rounded-2xl p-8 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Quote Icon */}
              <Quote className="absolute top-6 right-6 w-10 h-10 text-accent/30" />

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 fill-accent text-accent"
                  />
                ))}
              </div>

              {/* Content */}
              <p className="text-primary-foreground/90 mb-6 leading-relaxed">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
                  <span className="text-accent-foreground font-bold">
                    {testimonial.avatar}
                  </span>
                </div>
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-primary-foreground/60">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
