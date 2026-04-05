import React from "react";
import { Link } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";

const Cart: React.FC = () => {
  const { t } = useLanguage();
  const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCart();

  const shipping = totalPrice > 100 ? 0 : 9.99;
  const tax = totalPrice * 0.23;
  const finalTotal = totalPrice + shipping + tax;

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center bg-muted">
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted-foreground/10 flex items-center justify-center">
              <ShoppingBag className="w-12 h-12 text-muted-foreground" />
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground mb-2">
              {t("cart.empty")}
            </h1>
            <p className="text-muted-foreground mb-8">
              {t("cart.emptySubtitle")}
            </p>
            <Link to="/products">
              <Button variant="yellow" size="lg">
                {t("cart.startShopping")}
                <ArrowRight className="w-5 h-5 ml-2" />
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
      <main className="flex-1 bg-muted py-8">
        <div className="container mx-auto px-4">
          <h1 className="font-display text-3xl font-bold text-foreground mb-8">
            {t("cart.title")}
            <span className="text-muted-foreground font-normal text-lg ml-2">
              ({items.length} {t("cart.items")})
            </span>
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 bg-background rounded-2xl p-4 border border-border"
                >
                  {/* Image */}
                  <Link to={`/products/${item.id}`} className="flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-xl"
                    />
                  </Link>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/products/${item.id}`}
                      className="font-display font-semibold text-foreground hover:text-primary transition-colors line-clamp-2"
                    >
                      {item.name}
                    </Link>
                    <p className="text-sm text-muted-foreground mt-1">
                      {item.category}
                    </p>

                    <div className="flex items-center justify-between mt-4">
                      {/* Quantity */}
                      <div className="flex items-center border border-border rounded-lg">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="w-10 text-center font-semibold text-sm">
                          {item.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <div className="font-display font-bold text-foreground">
                          €{(item.price * item.quantity).toFixed(2)}
                        </div>
                        {item.quantity > 1 && (
                          <div className="text-xs text-muted-foreground">
                            €{item.price.toFixed(2)} {t("cart.each")}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Remove */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="flex-shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => removeItem(item.id)}
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </div>
              ))}

              {/* Clear Cart */}
              <div className="flex justify-end">
                <Button variant="ghost" onClick={clearCart}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  {t("cart.clearCart")}
                </Button>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-background rounded-2xl p-6 border border-border sticky top-24">
                <h2 className="font-display text-xl font-bold text-foreground mb-6">
                  {t("cart.orderSummary")}
                </h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t("cart.subtotal")}</span>
                    <span className="font-medium">€{totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t("cart.shipping")}</span>
                    <span className="font-medium">
                      {shipping === 0 ? (
                        <span className="text-green-600">{t("cart.free")}</span>
                      ) : (
                        `€${shipping.toFixed(2)}`
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t("cart.taxVat")}</span>
                    <span className="font-medium">€{tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-border pt-4">
                    <div className="flex justify-between">
                      <span className="font-display font-bold text-lg">{t("cart.total")}</span>
                      <span className="font-display font-bold text-lg">
                        €{finalTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Promo Code */}
                <div className="flex gap-2 mb-6">
                  <Input placeholder={t("cart.promoCode")} className="flex-1" />
                  <Button variant="outline">{t("common.apply")}</Button>
                </div>

                {/* Checkout Button */}
                <Button variant="yellow" size="lg" className="w-full">
                  {t("cart.proceedToCheckout")}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>

                {/* Free Shipping Message */}
                {shipping > 0 && (
                  <p className="text-center text-sm text-muted-foreground mt-4">
                    {t("cart.addMoreForFreeShipping").replace("{amount}", (100 - totalPrice).toFixed(2))}
                  </p>
                )}

                {/* Payment Methods */}
                <div className="mt-6 pt-6 border-t border-border">
                  <p className="text-sm text-muted-foreground text-center mb-3">
                    {t("cart.paymentMethods")}
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    <div className="px-3 py-1.5 bg-muted rounded-lg flex items-center justify-center text-xs font-bold">
                      PIX
                    </div>
                    <div className="px-3 py-1.5 bg-muted rounded-lg flex items-center justify-center text-xs font-bold">
                      MB WAY
                    </div>
                    <div className="px-3 py-1.5 bg-muted rounded-lg flex items-center justify-center text-xs font-bold">
                      MULTIBANCO
                    </div>
                    <div className="px-3 py-1.5 bg-muted rounded-lg flex items-center justify-center text-xs font-bold">
                      VISA
                    </div>
                    <div className="px-3 py-1.5 bg-muted rounded-lg flex items-center justify-center text-xs font-bold">
                      MASTERCARD
                    </div>
                    <div className="px-3 py-1.5 bg-muted rounded-lg flex items-center justify-center text-xs font-bold">
                      PAYPAL
                    </div>
                    <div className="px-3 py-1.5 bg-muted rounded-lg flex items-center justify-center text-xs font-bold">
                      TRANSFERÊNCIA
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Cart;