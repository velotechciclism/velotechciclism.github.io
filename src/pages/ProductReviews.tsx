import React, { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Star } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { products } from "@/data/products";
import { toast } from "sonner";

type StoredReview = {
  id: string;
  productId: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
};

const REVIEWS_KEY = "velotech:reviews";

function readReviews(): StoredReview[] {
  try {
    const raw = localStorage.getItem(REVIEWS_KEY);
    return raw ? (JSON.parse(raw) as StoredReview[]) : [];
  } catch {
    return [];
  }
}

function writeReviews(reviews: StoredReview[]) {
  localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));
}

const ProductReviews: React.FC = () => {
  const { id } = useParams();
  const product = products.find((item) => item.id === id);
  const [reviews, setReviews] = useState<StoredReview[]>(() => readReviews());
  const [formData, setFormData] = useState({ name: "", rating: 5, comment: "" });

  const productReviews = useMemo(
    () => reviews.filter((review) => review.productId === id),
    [id, reviews]
  );

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!product || !formData.name.trim() || !formData.comment.trim()) {
      toast.error("Preencha todos os campos.");
      return;
    }

    const review: StoredReview = {
      id: crypto.randomUUID(),
      productId: product.id,
      name: formData.name.trim(),
      rating: formData.rating,
      comment: formData.comment.trim(),
      createdAt: new Date().toISOString(),
    };

    const nextReviews = [review, ...reviews];
    writeReviews(nextReviews);
    setReviews(nextReviews);
    setFormData({ name: "", rating: 5, comment: "" });
    toast.success("Avaliação publicada.");
  };

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 bg-black flex items-center justify-center px-4">
          <div className="rounded-2xl border border-white/10 bg-muted p-8 text-center">
            <h1 className="font-display text-2xl font-bold text-foreground mb-4">
              Produto não encontrado
            </h1>
            <Link to="/products">
              <Button variant="yellow">
                Voltar aos produtos
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-black">
        <section className="bg-secondary py-10">
          <div className="container mx-auto px-4">
            <Link to={`/products/${product.id}`} className="mb-6 inline-flex items-center gap-2 text-sm text-primary hover:text-accent">
              <ArrowLeft className="h-4 w-4" />
              Voltar ao produto
            </Link>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-secondary-foreground">
              Avaliar produto
            </h1>
            <p className="mt-2 text-secondary-foreground/70">{product.name}</p>
          </div>
        </section>

        <section className="container mx-auto grid gap-8 px-4 py-12 lg:grid-cols-[420px_1fr]">
          <form onSubmit={handleSubmit} className="rounded-2xl border border-white/10 bg-muted p-6">
            <h2 className="font-display text-xl font-bold text-foreground mb-5">
              Sua avaliação
            </h2>
            <div className="space-y-4">
              <Input
                value={formData.name}
                onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="Seu nome"
              />
              <div>
                <label htmlFor="rating" className="mb-2 block text-sm font-medium text-foreground">
                  Nota
                </label>
                <select
                  id="rating"
                  value={formData.rating}
                  onChange={(event) => setFormData((prev) => ({ ...prev, rating: Number(event.target.value) }))}
                  className="h-10 w-full rounded-md border border-border bg-background px-3 text-foreground"
                >
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <option key={rating} value={rating}>
                      {rating} / 5
                    </option>
                  ))}
                </select>
              </div>
              <Textarea
                value={formData.comment}
                onChange={(event) => setFormData((prev) => ({ ...prev, comment: event.target.value }))}
                placeholder="Conte como foi sua experiência"
                rows={6}
              />
              <Button type="submit" variant="yellow" className="w-full">
                Publicar avaliação
              </Button>
            </div>
          </form>

          <div className="space-y-4">
            <h2 className="font-display text-xl font-bold text-secondary-foreground">
              Avaliações recentes
            </h2>
            {productReviews.length > 0 ? (
              productReviews.map((review) => (
                <article key={review.id} className="rounded-2xl border border-white/10 bg-muted p-5">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <h3 className="font-display font-bold text-foreground">{review.name}</h3>
                    <div className="flex items-center gap-1 text-primary">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="text-sm font-semibold">{review.rating}</span>
                    </div>
                  </div>
                  <p className="text-muted-foreground">{review.comment}</p>
                </article>
              ))
            ) : (
              <div className="rounded-2xl border border-white/10 bg-muted p-8 text-center text-muted-foreground">
                Ainda não há avaliações salvas neste navegador.
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ProductReviews;
