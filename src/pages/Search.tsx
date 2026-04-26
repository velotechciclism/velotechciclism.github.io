import React, { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, Search as SearchIcon } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/product/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { products } from "@/data/products";

const Search: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return products.slice(0, 8);
    }

    return products.filter((product) => {
      const text = `${product.name} ${product.description} ${product.category} ${product.brand}`.toLowerCase();
      return text.includes(normalized);
    });
  }, [query]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const nextQuery = query.trim();
    setSearchParams(nextQuery ? { q: nextQuery } : {});
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-black">
        <section className="bg-secondary py-12">
          <div className="container mx-auto px-4">
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-secondary-foreground mb-2">
              Busca
            </h1>
            <p className="text-secondary-foreground/70">
              Encontre produtos, categorias, marcas e acessórios da VeloTech.
            </p>
          </div>
        </section>

        <section className="container mx-auto px-4 py-12">
          <form onSubmit={handleSubmit} className="mb-10 flex flex-col gap-3 rounded-2xl border border-white/10 bg-muted p-4 sm:flex-row">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar por bicicleta, luva, marca..."
                className="h-11 pl-10"
              />
            </div>
            <Button type="submit" variant="yellow" className="h-11">
              Buscar
            </Button>
          </form>

          <div className="mb-6 flex items-center justify-between gap-4">
            <h2 className="font-display text-2xl font-bold text-secondary-foreground">
              {query.trim()
                ? `${results.length} resultado(s)`
                : "Sugestões populares"}
            </h2>
            <Link to="/products" className="hidden text-sm font-semibold text-primary hover:text-accent sm:inline-flex">
              Ver catálogo completo
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>

          {results.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {results.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-muted p-10 text-center">
              <p className="text-muted-foreground mb-5">
                Não encontramos produtos com esse termo.
              </p>
              <Link to="/products">
                <Button variant="outline">
                  Explorar produtos
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

export default Search;
