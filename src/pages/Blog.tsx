import React from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, Calendar, User } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface BlogPost {
  id: string;
  titleKey: string;
  excerptKey: string;
  categoryKey: string;
  author: string;
  dateKey: string;
  image: string;
}

const Blog: React.FC = () => {
  const { t, language } = useLanguage();
  const [searchParams] = useSearchParams();

  const blogPosts: BlogPost[] = [
    {
      id: "1",
      titleKey: "blog.posts.maintenance.title",
      excerptKey: "blog.posts.maintenance.excerpt",
      categoryKey: "blog.posts.maintenance.category",
      author: "Alex Johnson",
      dateKey: "blog.posts.maintenance.date",
      image: "🔧",
    },
    {
      id: "2",
      titleKey: "blog.posts.helmet.title",
      excerptKey: "blog.posts.helmet.excerpt",
      categoryKey: "blog.posts.helmet.category",
      author: "Sarah Cooper",
      dateKey: "blog.posts.helmet.date",
      image: "🛡️",
    },
    {
      id: "3",
      titleKey: "blog.posts.trails.title",
      excerptKey: "blog.posts.trails.excerpt",
      categoryKey: "blog.posts.trails.category",
      author: "Mike Wilson",
      dateKey: "blog.posts.trails.date",
      image: "⛰️",
    },
    {
      id: "4",
      titleKey: "blog.posts.training.title",
      excerptKey: "blog.posts.training.excerpt",
      categoryKey: "blog.posts.training.category",
      author: "Emily Davis",
      dateKey: "blog.posts.training.date",
      image: "🚴",
    },
    {
      id: "5",
      titleKey: "blog.posts.tech.title",
      excerptKey: "blog.posts.tech.excerpt",
      categoryKey: "blog.posts.tech.category",
      author: "James Brown",
      dateKey: "blog.posts.tech.date",
      image: "⚙️",
    },
    {
      id: "6",
      titleKey: "blog.posts.urban.title",
      excerptKey: "blog.posts.urban.excerpt",
      categoryKey: "blog.posts.urban.category",
      author: "Lisa Martinez",
      dateKey: "blog.posts.urban.date",
      image: "🏙️",
    },
  ];

  // Fallback content for blog posts
  const getPostContent = (post: BlogPost) => {
    const fallbackContent: Record<string, { title: string; excerpt: string; category: string; date: string }> = {
      "1": {
        title: language === "pt-br" ? "Dicas Essenciais de Manutenção de Bicicletas para Iniciantes" : "Essential Bike Maintenance Tips for Beginners",
        excerpt: language === "pt-br" ? "Aprenda as rotinas básicas de manutenção para manter sua bicicleta em perfeitas condições." : "Learn the basic maintenance routines to keep your bike in perfect condition and extend its lifespan.",
        category: language === "pt-br" ? "Manutenção" : "Maintenance",
        date: language === "pt-br" ? "12 de Janeiro, 2026" : "January 12, 2026",
      },
      "2": {
        title: language === "pt-br" ? "Escolhendo o Capacete Certo: Um Guia Completo" : "Choosing the Right Helmet: A Complete Guide",
        excerpt: language === "pt-br" ? "Segurança em primeiro lugar! Descubra como selecionar o capacete perfeito para suas aventuras." : "Safety first! Discover how to select the perfect helmet for your cycling adventures.",
        category: language === "pt-br" ? "Segurança" : "Safety",
        date: language === "pt-br" ? "10 de Janeiro, 2026" : "January 10, 2026",
      },
      "3": {
        title: language === "pt-br" ? "Trilhas de Mountain Bike: Melhores Destinos" : "Mountain Biking Trails: Top Destinations",
        excerpt: language === "pt-br" ? "Explore as melhores trilhas de mountain bike ao redor do mundo." : "Explore the best mountain biking trails around the world, from beginner-friendly to expert-only.",
        category: language === "pt-br" ? "Aventura" : "Adventure",
        date: language === "pt-br" ? "8 de Janeiro, 2026" : "January 8, 2026",
      },
      "4": {
        title: language === "pt-br" ? "Dicas de Treino para Sua Primeira Prova de 100 Milhas" : "Training Tips for Your First Century Ride",
        excerpt: language === "pt-br" ? "Prepare-se para uma prova de longa distância com nosso guia de treino." : "Prepare yourself for a 100-mile ride with our expert training guide and nutrition tips.",
        category: language === "pt-br" ? "Treino" : "Training",
        date: language === "pt-br" ? "5 de Janeiro, 2026" : "January 5, 2026",
      },
      "5": {
        title: language === "pt-br" ? "As Últimas Tendências em Tecnologia de Ciclismo" : "The Latest Cycling Technology Trends",
        excerpt: language === "pt-br" ? "Fique atualizado com as mais novas inovações em equipamentos de ciclismo." : "Stay updated with the newest innovations in cycling gear and technology.",
        category: language === "pt-br" ? "Tecnologia" : "Tech",
        date: language === "pt-br" ? "1 de Janeiro, 2026" : "January 1, 2026",
      },
      "6": {
        title: language === "pt-br" ? "Ciclismo Urbano: Dicas para Pedalar na Cidade" : "Urban Cycling: Tips for City Commuting",
        excerpt: language === "pt-br" ? "Torne seu trajeto diário mais seguro e agradável com estas dicas." : "Make your daily commute safer and more enjoyable with these urban cycling tips.",
        category: language === "pt-br" ? "Urbano" : "Urban",
        date: language === "pt-br" ? "28 de Dezembro, 2025" : "December 28, 2025",
      },
    };

    return fallbackContent[post.id] || {
      title: t(post.titleKey, post.titleKey),
      excerpt: t(post.excerptKey, post.excerptKey),
      category: t(post.categoryKey, post.categoryKey),
      date: t(post.dateKey, post.dateKey),
    };
  };

  const selectedPostId = searchParams.get("post") || blogPosts[0].id;
  const selectedPost = blogPosts.find((post) => post.id === selectedPostId) || blogPosts[0];
  const selectedPostContent = getPostContent(selectedPost);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-green-950/95">
        {/* Page Header */}
        <div className="bg-secondary py-12">
          <div className="container mx-auto px-4">
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-secondary-foreground mb-2">
              {t("blog.pageTitle")}
            </h1>
            <p className="text-secondary-foreground/70">
              {t("blog.subtitle")}
            </p>
          </div>
        </div>

        {/* Featured Post */}
        <div className="container mx-auto px-4 py-12">
          <div className="rounded-2xl bg-gradient-to-r from-primary/20 to-accent/20 p-8 sm:p-12 mb-16 border border-primary/20">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-center">
              <div>
                <span className="inline-block px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-semibold mb-4">
                  {t("blog.featured")}
                </span>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-4">
                  {selectedPostContent.title}
                </h2>
                <p className="text-muted-foreground mb-6">{selectedPostContent.excerpt}</p>
                <div className="flex gap-4 mb-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {selectedPost.author}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {selectedPostContent.date}
                  </div>
                </div>
                <Link to={`/blog?post=${selectedPost.id}`}>
                  <Button className="group">
                    {t("blog.readArticle")}
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
              <div className="flex items-center justify-center h-64 bg-muted rounded-xl text-6xl">
                {selectedPost.image}
              </div>
            </div>
          </div>

          {/* Blog Posts Grid */}
          <h2 className="font-display text-2xl font-bold text-secondary-foreground mb-8">
            {t("blog.latestArticles")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogPosts.slice(1).map((post, index) => {
              const content = getPostContent(post);
              return (
                <article
                  key={post.id}
                  className="group rounded-2xl bg-muted hover:shadow-lg transition-all duration-300 overflow-hidden animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="h-48 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center text-5xl group-hover:scale-105 transition-transform">
                    {post.image}
                  </div>
                  <div className="p-6">
                    <span className="inline-block px-2 py-1 bg-primary/10 text-primary rounded text-xs font-semibold mb-3">
                      <Link to={`/blog?post=${post.id}`}>{content.category}</Link>
                    </span>
                    <h3 className="font-display font-bold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                      {content.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {content.excerpt}
                    </p>
                    <div className="flex gap-4 text-xs text-muted-foreground mb-4 pb-4 border-b border-border">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {post.author}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {content.date}
                      </div>
                    </div>
                    <Link to={`/blog?post=${post.id}`}>
                      <Button variant="outline" className="w-full group">
                        {t("blog.readMore")}
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

      </main>
      <Footer />
    </div>
  );
};

export default Blog;