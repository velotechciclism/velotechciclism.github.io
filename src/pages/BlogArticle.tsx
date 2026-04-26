import React from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, Tag, User } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { BlogLanguage, blogPosts, getBlogPost } from "@/data/blogPosts";

const BlogArticle: React.FC = () => {
  const { postId } = useParams();
  const { t, language } = useLanguage();
  const lang = language as BlogLanguage;
  const post = getBlogPost(postId);

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 bg-black flex items-center justify-center px-4">
          <div className="max-w-xl text-center rounded-2xl border border-white/10 bg-muted p-8">
            <h1 className="font-display text-2xl font-bold text-foreground mb-3">
              {language === "pt-br" ? "Artigo nao encontrado" : "Article not found"}
            </h1>
            <p className="text-muted-foreground mb-6">
              {language === "pt-br"
                ? "O artigo que voce tentou abrir nao existe ou foi movido."
                : "The article you tried to open does not exist or was moved."}
            </p>
            <Link to="/blog">
              <Button variant="yellow">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {language === "pt-br" ? "Voltar ao blog" : "Back to blog"}
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const content = post.content[lang];
  const relatedPosts = blogPosts.filter((item) => item.id !== post.id).slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-black">
        <section className="bg-secondary py-10">
          <div className="container mx-auto px-4">
            <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-primary hover:text-accent mb-8">
              <ArrowLeft className="w-4 h-4" />
              {language === "pt-br" ? "Voltar ao blog" : "Back to blog"}
            </Link>
            <div className="max-w-4xl">
              <span className="inline-flex rounded-full bg-primary/15 px-3 py-1 text-sm font-semibold text-primary">
                {content.category}
              </span>
              <h1 className="mt-5 font-display text-4xl font-black tracking-tight text-secondary-foreground sm:text-5xl">
                {content.title}
              </h1>
              <p className="mt-5 max-w-3xl text-lg leading-relaxed text-secondary-foreground/75">
                {content.intro}
              </p>
              <div className="mt-6 flex flex-wrap gap-4 text-sm text-secondary-foreground/65">
                <span className="inline-flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {post.author}
                </span>
                <span className="inline-flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {content.date}
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-12">
          <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
            <article className="rounded-2xl border border-white/10 bg-muted p-6 sm:p-10">
              <div className="mb-8 flex h-48 items-center justify-center rounded-xl bg-black/30 text-7xl font-black text-primary ring-1 ring-white/10">
                {post.marker}
              </div>
              <div className="space-y-8">
                {content.sections.map((section) => (
                  <section key={section.heading}>
                    <h2 className="font-display text-2xl font-bold text-foreground mb-3">
                      {section.heading}
                    </h2>
                    <p className="text-muted-foreground leading-relaxed">
                      {section.body}
                    </p>
                  </section>
                ))}
              </div>
              <div className="mt-10 flex flex-wrap gap-2 border-t border-border pt-6">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
              </div>
            </article>

            <aside className="space-y-4">
              <h2 className="font-display text-xl font-bold text-secondary-foreground">
                {t("blog.relatedArticles")}
              </h2>
              {relatedPosts.map((item) => {
                const related = item.content[lang];
                return (
                  <Link
                    key={item.id}
                    to={`/blog/${item.id}`}
                    className="block rounded-xl border border-white/10 bg-muted p-4 transition hover:border-primary/50"
                  >
                    <span className="text-xs font-semibold text-primary">{related.category}</span>
                    <h3 className="mt-2 font-display font-bold text-foreground">
                      {related.title}
                    </h3>
                  </Link>
                );
              })}
            </aside>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default BlogArticle;
