import React from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar, User } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { BlogLanguage, blogPosts } from "@/data/blogPosts";

const Blog: React.FC = () => {
  const { t, language } = useLanguage();
  const lang = language as BlogLanguage;
  const featuredPost = blogPosts[0];
  const featuredContent = featuredPost.content[lang];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-green-950/95">
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

        <div className="container mx-auto px-4 py-12">
          <div className="rounded-2xl bg-gradient-to-r from-primary/20 to-accent/20 p-8 sm:p-12 mb-16 border border-primary/20">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-center">
              <div>
                <span className="inline-block px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-semibold mb-4">
                  {t("blog.featured")}
                </span>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-4">
                  {featuredContent.title}
                </h2>
                <p className="text-muted-foreground mb-6">{featuredContent.excerpt}</p>
                <div className="flex flex-wrap gap-4 mb-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {featuredPost.author}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {featuredContent.date}
                  </div>
                </div>
                <Link to={`/blog/${featuredPost.id}`}>
                  <Button className="group">
                    {t("blog.readArticle")}
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
              <div className="flex h-64 items-center justify-center rounded-xl bg-black/30 text-7xl font-black text-primary ring-1 ring-white/10">
                {featuredPost.marker}
              </div>
            </div>
          </div>

          <h2 className="font-display text-2xl font-bold text-secondary-foreground mb-8">
            {t("blog.latestArticles")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogPosts.slice(1).map((post, index) => {
              const content = post.content[lang];
              return (
                <article
                  key={post.id}
                  className="group rounded-2xl bg-muted hover:shadow-lg transition-all duration-300 overflow-hidden animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="h-48 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center text-5xl font-black text-primary group-hover:scale-105 transition-transform">
                    {post.marker}
                  </div>
                  <div className="p-6">
                    <Link
                      to={`/blog/${post.id}`}
                      className="inline-block px-2 py-1 bg-primary/10 text-primary rounded text-xs font-semibold mb-3"
                    >
                      {content.category}
                    </Link>
                    <h3 className="font-display font-bold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                      {content.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {content.excerpt}
                    </p>
                    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mb-4 pb-4 border-b border-border">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {post.author}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {content.date}
                      </div>
                    </div>
                    <Link to={`/blog/${post.id}`}>
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
