import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/product/ProductCard";
import { Button } from "@/components/ui/button";
import { products } from "@/data/products";
import { readWishlistIds, removeFromWishlist } from "@/lib/wishlist";
import { useLanguage } from "@/context/LanguageContext";

const Wishlist: React.FC = () => {
  const { language } = useLanguage();
  const [wishlistIds, setWishlistIds] = useState<string[]>(() => readWishlistIds());

  const wishlistProducts = useMemo(
    () => products.filter((product) => wishlistIds.includes(product.id)),
    [wishlistIds]
  );

  const handleRemove = (productId: string) => {
    removeFromWishlist(productId);
    setWishlistIds(readWishlistIds());
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-green-950/95">
        <section className="bg-secondary py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-3">
              <Heart className="h-8 w-8 text-primary" />
              <div>
                <h1 className="font-display text-3xl sm:text-4xl font-bold text-secondary-foreground">
                  {language === "pt-br" ? "Favoritos" : "Wishlist"}
                </h1>
                <p className="mt-2 text-secondary-foreground/70">
                  {language === "pt-br"
                    ? "Produtos salvos para comparar ou comprar depois."
                    : "Saved products to compare or buy later."}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-12">
          {wishlistProducts.length > 0 ? (
            <div className="space-y-8">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {wishlistProducts.map((product) => (
                  <div key={product.id} className="space-y-3">
                    <ProductCard product={product} />
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleRemove(product.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {language === "pt-br" ? "Remover dos favoritos" : "Remove from wishlist"}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-xl rounded-2xl border border-white/10 bg-muted p-10 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <ShoppingBag className="h-8 w-8 text-primary" />
              </div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-3">
                {language === "pt-br" ? "Nada salvo ainda" : "Nothing saved yet"}
              </h2>
              <p className="text-muted-foreground mb-6">
                {language === "pt-br"
                  ? "Use o coracao nos produtos para montar sua lista de favoritos."
                  : "Use the heart button on products to build your wishlist."}
              </p>
              <Link to="/products">
                <Button variant="yellow">
                  {language === "pt-br" ? "Ver produtos" : "View products"}
                </Button>
              </Link>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Wishlist;
