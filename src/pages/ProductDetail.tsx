import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ChevronLeft,
  Star,
  Heart,
  Share2,
  Truck,
  Shield,
  RotateCcw,
  Minus,
  Plus,
  ShoppingCart,
  Check,
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/product/ProductCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { products } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import { toast } from "sonner";

const ProductDetail: React.FC = () => {
  const { t } = useLanguage();
  const { id } = useParams();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const product = products.find((p) => p.id === id);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-display text-2xl font-bold mb-4">
              {t("products.productNotFound")}
            </h1>
            <Link to="/products">
              <Button variant="outline">
                <ChevronLeft className="w-4 h-4 mr-2" />
                {t("products.backToProducts")}
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const handleAddToCart = () => {
    addItem(product, quantity);
    toast.success(`${quantity}x ${product.name} ${t("notifications.addedToCart")}`);
  };

  const discount = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100
      )
    : 0;

  const images = [product.image, product.image, product.image];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-background">
        {/* Breadcrumb */}
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">
              {t("common.home")}
            </Link>
            <span>/</span>
            <Link to="/products" className="hover:text-foreground transition-colors">
              {t("common.products")}
            </Link>
            <span>/</span>
            <Link
              to={`/products?category=${product.category.toLowerCase()}`}
              className="hover:text-foreground transition-colors"
            >
              {product.category}
            </Link>
            <span>/</span>
            <span className="text-foreground">{product.name}</span>
          </nav>
        </div>

        {/* Product Section */}
        <section className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Images */}
            <div className="space-y-4">
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted">
                <img
                  src={images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {product.isNew && (
                  <span className="absolute top-4 left-4 px-3 py-1 text-xs font-bold rounded-full bg-primary text-primary-foreground">
                    {t("products.new")}
                  </span>
                )}
                {discount > 0 && (
                  <span className="absolute top-4 left-20 px-3 py-1 text-xs font-bold rounded-full bg-destructive text-destructive-foreground">
                    -{discount}%
                  </span>
                )}
              </div>
              <div className="flex gap-4">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === index
                        ? "border-primary"
                        : "border-transparent hover:border-muted-foreground/30"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Details */}
            <div className="space-y-6">
              {/* Brand & Name */}
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  {product.brand}
                </p>
                <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4">
                  {product.name}
                </h1>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(product.rating)
                            ? "fill-velo-yellow text-velo-yellow"
                            : "text-muted-foreground"
                        }`}
                      />
                    ))}
                    <span className="font-semibold ml-2">{product.rating}</span>
                  </div>
                  <span className="text-muted-foreground">
                    ({product.reviewCount} {t("products.reviews")})
                  </span>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="font-display text-4xl font-bold text-foreground">
                  €{product.price.toFixed(2)}
                </span>
                {product.originalPrice && (
                  <span className="text-xl text-muted-foreground line-through">
                    €{product.originalPrice.toFixed(2)}
                  </span>
                )}
                {discount > 0 && (
                  <span className="px-2 py-1 text-sm font-semibold rounded bg-destructive/10 text-destructive">
                    {t("products.save")} €{(product.originalPrice! - product.price).toFixed(2)}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>

              {/* Quantity & Add to Cart */}
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-border rounded-lg">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-12 text-center font-semibold">
                    {quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <Button
                  variant="yellow"
                  size="lg"
                  className="flex-1"
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {t("products.addToCart")}
                </Button>
                <Button variant="outline" size="lg">
                  <Heart className="w-5 h-5" />
                </Button>
                <Button variant="outline" size="lg">
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium">{t("products.shipsWithin24h")}</span>
              </div>

              {/* Features */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border">
                <div className="flex flex-col items-center text-center gap-2 p-4 rounded-xl bg-muted">
                  <Truck className="w-6 h-6 text-primary" />
                  <span className="text-xs font-medium">{t("products.freeShipping")}</span>
                </div>
                <div className="flex flex-col items-center text-center gap-2 p-4 rounded-xl bg-muted">
                  <Shield className="w-6 h-6 text-primary" />
                  <span className="text-xs font-medium">{t("products.warranty")}</span>
                </div>
                <div className="flex flex-col items-center text-center gap-2 p-4 rounded-xl bg-muted">
                  <RotateCcw className="w-6 h-6 text-primary" />
                  <span className="text-xs font-medium">{t("products.returns")}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tabs */}
        <section className="container mx-auto px-4 py-12">
          <Tabs defaultValue="specs" className="w-full">
            <TabsList className="w-full max-w-md mx-auto grid grid-cols-3">
              <TabsTrigger value="specs">{t("products.specifications")}</TabsTrigger>
              <TabsTrigger value="description">{t("products.description")}</TabsTrigger>
              <TabsTrigger value="reviews">{t("products.reviews")}</TabsTrigger>
            </TabsList>
            <TabsContent value="specs" className="mt-8">
              {product.specs && (
                <div className="max-w-2xl mx-auto bg-muted rounded-2xl p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Object.entries(product.specs).map(([key, value]) => (
                      <div
                        key={key}
                        className="flex justify-between py-3 border-b border-border last:border-0"
                      >
                        <span className="font-medium text-foreground">{key}</span>
                        <span className="text-muted-foreground">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
            <TabsContent value="description" className="mt-8">
              <div className="max-w-2xl mx-auto prose prose-gray">
                <p>{product.description}</p>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  Ut enim ad minim veniam, quis nostrud exercitation ullamco
                  laboris.
                </p>
              </div>
            </TabsContent>
            <TabsContent value="reviews" className="mt-8">
              <div className="max-w-2xl mx-auto text-center py-8">
                <p className="text-muted-foreground">
                  {t("products.noReviewsYet")}
                </p>
                <Button variant="outline" className="mt-4">
                  {t("products.writeReview")}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </section>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="container mx-auto px-4 py-12 border-t border-border">
            <h2 className="font-display text-2xl font-bold text-foreground mb-8">
              {t("products.youMightAlsoLike")}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;