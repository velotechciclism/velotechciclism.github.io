import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, CreditCard, LockKeyhole } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import { useAuthContext } from "@/context/AuthContext";
import { toast } from "sonner";

const PAYMENT_METHODS = ["Visa", "Mastercard", "PayPal", "MB Way", "Apple Pay", "Google Pay"] as const;
const CARD_PAYMENT_METHODS = new Set<string>(["Visa", "Mastercard"]);

const formatCardNumber = (value: string) =>
  value
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, "$1 ")
    .trim();

const formatExpiry = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
};

const isValidExpiry = (value: string) => {
  const [monthValue, yearValue] = value.split("/");
  const month = Number(monthValue);
  const year = Number(`20${yearValue}`);

  if (!monthValue || !yearValue || month < 1 || month > 12) {
    return false;
  }

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  return year > currentYear || (year === currentYear && month >= currentMonth);
};

const Cart: React.FC = () => {
  const { t } = useLanguage();
  const { items, removeItem, updateQuantity, totalPrice, clearCart, checkout } = useCart();
  const { isAuthenticated } = useAuthContext();
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromoCode, setAppliedPromoCode] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("Visa");
  const [cardData, setCardData] = useState({
    holder: "",
    number: "",
    expiry: "",
    cvc: "",
    billingPostalCode: "",
  });

  const shipping = totalPrice > 100 ? 0 : 9.99;
  const tax = totalPrice * 0.23;
  const promoDiscountRate =
    appliedPromoCode === "VELO10" ? 0.1 : appliedPromoCode === "BIKE15" && totalPrice >= 100 ? 0.15 : 0;
  const promoDiscount = totalPrice * promoDiscountRate;
  const finalTotal = totalPrice + shipping + tax - promoDiscount;

  useEffect(() => {
    if (appliedPromoCode === "BIKE15" && totalPrice < 100) {
      setAppliedPromoCode(null);
    }
  }, [appliedPromoCode, totalPrice]);

  const showCartError = (error: unknown) => {
    const message = error instanceof Error ? error.message : t("notifications.checkoutError");
    toast.error(message);
  };

  const handleUpdateQuantity = async (productId: string, quantity: number) => {
    try {
      await updateQuantity(productId, quantity);
    } catch (error) {
      showCartError(error);
    }
  };

  const handleRemoveItem = async (productId: string) => {
    try {
      await removeItem(productId);
    } catch (error) {
      showCartError(error);
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCart();
    } catch (error) {
      showCartError(error);
    }
  };

  const handleApplyPromoCode = () => {
    const normalizedCode = promoCode.trim().toUpperCase();

    if (normalizedCode === "VELO10") {
      setAppliedPromoCode(normalizedCode);
      toast.success("Cupom VELO10 aplicado.");
      return;
    }

    if (normalizedCode === "BIKE15") {
      if (totalPrice < 100) {
        toast.error("BIKE15 requer subtotal minimo de EUR 100.");
        return;
      }

      setAppliedPromoCode(normalizedCode);
      toast.success("Cupom BIKE15 aplicado.");
      return;
    }

    setAppliedPromoCode(null);
    toast.error("Cupom invalido. Tente VELO10 ou BIKE15.");
  };

  const validatePayment = () => {
    if (!CARD_PAYMENT_METHODS.has(paymentMethod)) {
      return true;
    }

    const cardDigits = cardData.number.replace(/\D/g, "");
    const holder = cardData.holder.trim();
    const cvc = cardData.cvc.replace(/\D/g, "");
    const postalCode = cardData.billingPostalCode.trim();

    if (holder.length < 3) {
      toast.error("Informe o nome impresso no cartão fictício.");
      return false;
    }

    if (cardDigits.length < 13 || cardDigits.length > 16) {
      toast.error("Informe um número de cartão fictício válido.");
      return false;
    }

    if (!isValidExpiry(cardData.expiry)) {
      toast.error("Informe uma validade futura no formato MM/AA.");
      return false;
    }

    if (cvc.length < 3 || cvc.length > 4) {
      toast.error("Informe um CVC fictício com 3 ou 4 dígitos.");
      return false;
    }

    if (postalCode.length < 4) {
      toast.error("Informe o código postal de faturação.");
      return false;
    }

    return true;
  };

  const handleFinalizarCompra = async () => {
    if (!isAuthenticated) {
      toast.error("Entre na sua conta para finalizar a compra");
      return;
    }

    if (!validatePayment()) {
      return;
    }

    try {
      const cardDigits = cardData.number.replace(/\D/g, "");
      const paymentLabel = CARD_PAYMENT_METHODS.has(paymentMethod)
        ? `${paymentMethod} final ${cardDigits.slice(-4)} (simulado)`
        : `${paymentMethod} (simulado)`;

      await checkout(paymentLabel, "Endereco nao informado", appliedPromoCode || undefined);
      toast.success(t("notifications.checkoutSuccess"));
      setCardData({
        holder: "",
        number: "",
        expiry: "",
        cvc: "",
        billingPostalCode: "",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : t("notifications.checkoutError");
      toast.error(message);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center bg-black text-white">
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
      <main className="flex-1 bg-black text-white py-8">
        <div className="container mx-auto px-4">
            <h1 className="font-display text-3xl font-bold text-white mb-8">
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
                  className="flex gap-4 bg-zinc-900 rounded-2xl p-4 border border-zinc-700"
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
                      className="font-display font-semibold text-white hover:text-primary transition-colors line-clamp-2"
                    >
                      {item.name}
                    </Link>
                    <p className="text-sm text-zinc-300 mt-1">
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
                            handleUpdateQuantity(item.id, item.quantity - 1)
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
                            handleUpdateQuantity(item.id, item.quantity + 1)
                          }
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <div className="font-display font-bold text-white">
                          €{(item.price * item.quantity).toFixed(2)}
                        </div>
                        {item.quantity > 1 && (
                          <div className="text-xs text-zinc-300">
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
                    onClick={() => handleRemoveItem(item.id)}
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </div>
              ))}

              {/* Clear Cart */}
              <div className="flex justify-end">
                <Button variant="ghost" onClick={handleClearCart}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  {t("cart.clearCart")}
                </Button>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-700 sticky top-24">
                <h2 className="font-display text-xl font-bold text-white mb-6">
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
                  {promoDiscount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-primary">
                        {t("cart.promoCode")} {appliedPromoCode}
                      </span>
                      <span className="font-medium text-primary">
                        -€{promoDiscount.toFixed(2)}
                      </span>
                    </div>
                  )}
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
                  <Input
                    placeholder={t("cart.promoCode")}
                    value={promoCode}
                    onChange={(event) => setPromoCode(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        handleApplyPromoCode();
                      }
                    }}
                    className="flex-1"
                  />
                  <Button variant="outline" onClick={handleApplyPromoCode}>
                    {t("common.apply")}
                  </Button>
                </div>

                {/* Payment Methods */}
                <div className="mt-6 pt-6 border-t border-border">
                  <div className="mb-4 flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    <h3 className="font-display text-lg font-bold text-white">
                      Pagamento fictício
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {PAYMENT_METHODS.map((method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setPaymentMethod(method)}
                        className={`min-h-10 rounded-lg px-3 py-2 text-xs font-bold transition ${
                          paymentMethod === method
                            ? "bg-primary text-primary-foreground"
                            : "bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
                        }`}
                      >
                        {method}
                      </button>
                    ))}
                  </div>

                  {CARD_PAYMENT_METHODS.has(paymentMethod) ? (
                    <div className="mt-4 space-y-3 rounded-xl border border-zinc-700 bg-black/30 p-4">
                      <Input
                        value={cardData.holder}
                        onChange={(event) => setCardData((prev) => ({ ...prev, holder: event.target.value }))}
                        placeholder="Nome no cartão"
                        autoComplete="cc-name"
                      />
                      <Input
                        value={cardData.number}
                        onChange={(event) => setCardData((prev) => ({ ...prev, number: formatCardNumber(event.target.value) }))}
                        placeholder="4242 4242 4242 4242"
                        inputMode="numeric"
                        autoComplete="cc-number"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          value={cardData.expiry}
                          onChange={(event) => setCardData((prev) => ({ ...prev, expiry: formatExpiry(event.target.value) }))}
                          placeholder="MM/AA"
                          inputMode="numeric"
                          autoComplete="cc-exp"
                        />
                        <Input
                          value={cardData.cvc}
                          onChange={(event) => setCardData((prev) => ({ ...prev, cvc: event.target.value.replace(/\D/g, "").slice(0, 4) }))}
                          placeholder="CVC"
                          inputMode="numeric"
                          autoComplete="cc-csc"
                        />
                      </div>
                      <Input
                        value={cardData.billingPostalCode}
                        onChange={(event) => setCardData((prev) => ({ ...prev, billingPostalCode: event.target.value }))}
                        placeholder="Código postal de faturação"
                        autoComplete="billing postal-code"
                      />
                    </div>
                  ) : (
                    <div className="mt-4 rounded-xl border border-zinc-700 bg-black/30 p-4 text-sm text-zinc-300">
                      {paymentMethod} será confirmado em modo demonstrativo, sem cobrança real.
                    </div>
                  )}

                  <div className="mt-3 flex items-start gap-2 rounded-lg bg-zinc-950/70 p-3 text-xs text-zinc-300">
                    <LockKeyhole className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                    <p>
                      Dados fictícios: o site valida o formulário apenas no navegador e não guarda número do cartão nem CVC.
                    </p>
                  </div>
                </div>

                {/* Botão de finalização */}
                <Button variant="yellow" size="lg" className="mt-6 w-full" onClick={handleFinalizarCompra}>
                  {t("cart.finalizePurchase")}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>

                {/* Free Shipping Message */}
                {shipping > 0 && (
                  <p className="text-center text-sm text-muted-foreground mt-4">
                    {t("cart.addMoreForFreeShipping").replace("{amount}", (100 - totalPrice).toFixed(2))}
                  </p>
                )}
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
