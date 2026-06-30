import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { ThemeProvider } from "@/context/ThemeContext";
import PwaInstallPrompt from "@/components/pwa/PwaInstallPrompt";
import { lazy, Suspense } from "react";

const Index = lazy(() => import("./pages/Index"));
const Products = lazy(() => import("./pages/Products"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Cart = lazy(() => import("./pages/Cart"));
const Auth = lazy(() => import("./pages/Auth"));
const Brands = lazy(() => import("./pages/Brands"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogArticle = lazy(() => import("./pages/BlogArticle"));
const Contact = lazy(() => import("./pages/Contact"));
const Help = lazy(() => import("./pages/Help"));
const OrderHistory = lazy(() => import("./pages/OrderHistory"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const Cookies = lazy(() => import("./pages/Cookies"));
const Search = lazy(() => import("./pages/Search"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const ProductReviews = lazy(() => import("./pages/ProductReviews"));
const Offers = lazy(() => import("./pages/Offers"));
const About = lazy(() => import("./pages/About"));
const Careers = lazy(() => import("./pages/Careers"));
const Press = lazy(() => import("./pages/Press"));
const NotFound = lazy(() => import("./pages/NotFound"));
const ChatbotWidget = lazy(() => import("@/components/chatbot/ChatbotWidget"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <CartProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <HashRouter>
                <Suspense fallback={<div className="min-h-screen bg-background" aria-label="Carregando pagina" />}>
                  <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/products/:id" element={<ProductDetail />} />
                  <Route path="/products/:id/reviews" element={<ProductReviews />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/brands" element={<Brands />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/blog/:postId" element={<BlogArticle />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/help" element={<Help />} />
                  <Route path="/orders" element={<OrderHistory />} />
                  <Route path="/search" element={<Search />} />
                  <Route path="/wishlist" element={<Wishlist />} />
                  <Route path="/offers" element={<Offers />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/careers" element={<Careers />} />
                  <Route path="/press" element={<Press />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/cookies" element={<Cookies />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
                <Suspense fallback={null}><ChatbotWidget /></Suspense>
                <PwaInstallPrompt />
              </HashRouter>
          </TooltipProvider>
        </CartProvider>
      </AuthProvider>
    </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
