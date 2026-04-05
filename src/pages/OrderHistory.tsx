import React from "react";
import { Link } from "react-router-dom";
import { Package, ArrowLeft, ShoppingBag, Calendar, CreditCard } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrders } from "@/hooks/useOrders";
import { useLanguage } from "@/context/LanguageContext";
import { useAuthContext } from "@/context/AuthContext";

const OrderHistory: React.FC = () => {
  const { t } = useLanguage();
  const { isAuthenticated, isLoading: authLoading } = useAuthContext();
  const { orders, isLoading } = useOrders();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return t('orders.statusCompleted');
      case 'pending':
        return t('orders.statusPending');
      case 'cancelled':
        return t('orders.statusCancelled');
      case 'processing':
        return t('orders.statusProcessing');
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 bg-muted py-8">
          <div className="container mx-auto px-4">
            <Skeleton className="h-10 w-64 mb-8" />
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-40 w-full rounded-2xl" />
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center bg-muted">
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted-foreground/10 flex items-center justify-center">
              <Package className="w-12 h-12 text-muted-foreground" />
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground mb-2">
              {t('orders.loginRequired')}
            </h1>
            <p className="text-muted-foreground mb-8">
              {t('orders.loginRequiredSubtitle')}
            </p>
            <Link to="/auth">
              <Button variant="yellow" size="lg">
                {t('common.login')}
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center bg-muted">
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted-foreground/10 flex items-center justify-center">
              <ShoppingBag className="w-12 h-12 text-muted-foreground" />
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground mb-2">
              {t('orders.empty')}
            </h1>
            <p className="text-muted-foreground mb-8">
              {t('orders.emptySubtitle')}
            </p>
            <Link to="/products">
              <Button variant="yellow" size="lg">
                {t('cart.startShopping')}
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
          <div className="flex items-center gap-4 mb-8">
            <Link to="/products">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="font-display text-3xl font-bold text-foreground">
              {t('orders.title')}
            </h1>
          </div>

          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-background rounded-2xl border border-border overflow-hidden"
              >
                {/* Order Header */}
                <div className="p-4 sm:p-6 border-b border-border bg-muted/30">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(order.created_at)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {t('orders.orderId')}: {order.id.slice(0, 8)}...
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge className={getStatusColor(order.status)}>
                        {getStatusText(order.status)}
                      </Badge>
                      {order.payment_method && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <CreditCard className="w-4 h-4" />
                          <span>{order.payment_method}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-4 sm:p-6 space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <Link to={`/products/${item.product_id}`} className="flex-shrink-0">
                        <img
                          src={item.product_image || '/placeholder.svg'}
                          alt={item.product_name}
                          className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl"
                        />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/products/${item.product_id}`}
                          className="font-medium text-foreground hover:text-primary transition-colors line-clamp-2"
                        >
                          {item.product_name}
                        </Link>
                        <p className="text-sm text-muted-foreground mt-1">
                          {t('orders.quantity')}: {item.quantity}
                        </p>
                        <p className="font-semibold text-foreground mt-1">
                          €{(item.product_price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Footer */}
                <div className="p-4 sm:p-6 border-t border-border bg-muted/30">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-muted-foreground">
                      {t('orders.totalItems')}: {order.items.reduce((sum, item) => sum + item.quantity, 0)}
                    </span>
                    <div className="text-right">
                      <span className="text-sm text-muted-foreground">{t('cart.total')}: </span>
                      <span className="font-display font-bold text-xl text-foreground">
                        €{order.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OrderHistory;
