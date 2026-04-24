import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  User,
  Search,
  Menu,
  X,
  ChevronDown,
  Globe,
  LogOut,
  Package,
  Heart,
} from "lucide-react";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useAuthContext } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header: React.FC = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const { totalItems } = useCart();
  const { isAuthenticated, profile, logout, isLoading } = useAuthContext();

  const navLinks = [
    { name: t("common.home"), href: "/" },
    { name: t("common.products"), href: "/products" },
    { name: t("common.brands"), href: "/brands" },
    { name: t("common.blog"), href: "/blog" },
    { name: t("common.contact"), href: "/contact" },
    { name: t("common.help"), href: "/help" },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-secondary/95 text-secondary-foreground backdrop-blur-md border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo - Removed */}
          <Link to="/" className="flex items-center group">
            <span className="text-2xl font-bold text-primary">VeloTech</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="text-sm font-medium text-secondary-foreground/80 hover:text-secondary-foreground transition-colors relative group"
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2 lg:gap-4">
            {/* Search */}
            <Link to="/search" className="hidden sm:block">
              <Button variant="ghost" size="icon" className="hover:bg-white/10" aria-label={t("common.search")}>
                <Search className="w-5 h-5" />
              </Button>
            </Link>

            <Link to="/wishlist" className="hidden sm:block">
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-white/10"
                aria-label={language === "pt-br" ? "Favoritos" : "Wishlist"}
              >
                <Heart className="w-5 h-5" />
              </Button>
            </Link>

            {/* Theme Switcher */}
            <ThemeSwitcher />

            {/* Language Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="hidden sm:flex gap-1 hover:bg-white/10">
                  <Globe className="w-4 h-4" />
                  <span className="text-xs font-medium">
                    {language === "en" ? "EN" : "PT"}
                  </span>
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-popover">
                <DropdownMenuItem onClick={() => setLanguage("en")}>
                  🇺🇸 English
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage("pt-br")}>
                  🇧🇷 Português
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2 hover:bg-white/10">
                    <User className="w-5 h-5" />
                    <span className="hidden md:inline text-sm font-medium max-w-24 truncate">
                      {profile?.name || 'Usuário'}
                    </span>
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-popover w-48">
                  <div className="px-2 py-1.5 text-sm font-medium text-foreground">
                    {profile?.name || t("common.name")}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/orders" className="cursor-pointer">
                      <Package className="w-4 h-4 mr-2" />
                      {t("orders.title")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/wishlist" className="cursor-pointer">
                      <Heart className="w-4 h-4 mr-2" />
                      {language === "pt-br" ? "Favoritos" : "Wishlist"}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    disabled={isLoading}
                    className="text-red-600 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    {t("common.logout")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button variant="ghost" size="icon" className="hover:bg-white/10">
                  <User className="w-5 h-5" />
                </Button>
              </Link>
            )}

            {/* Cart */}
            <Link to="/cart">
              <Button variant="ghost" size="icon" className="relative hover:bg-white/10">
                <ShoppingCart className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-accent-foreground text-xs font-bold rounded-full flex items-center justify-center animate-scale-in">
                    {totalItems}
                  </span>
                )}
              </Button>
            </Link>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden hover:bg-white/10"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="lg:hidden py-4 border-t border-border animate-slide-up">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="px-4 py-3 text-sm font-medium text-foreground hover:bg-muted rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <Link
                to="/search"
                className="px-4 py-3 text-sm font-medium text-foreground hover:bg-muted rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {t("common.search")}
              </Link>
              <Link
                to="/wishlist"
                className="px-4 py-3 text-sm font-medium text-foreground hover:bg-muted rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {language === "pt-br" ? "Favoritos" : "Wishlist"}
              </Link>
              <div className="pt-4 border-t border-border mt-2">
                {isAuthenticated ? (
                  <div className="px-4 space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      {t("auth.welcome", "Olá")}, {profile?.name || t("common.name")}
                    </p>
                    <Link 
                      to="/orders" 
                      className="block text-sm text-primary mb-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Package className="w-4 h-4 inline mr-2" />
                      {t("orders.title")}
                    </Link>
                    <Link
                      to="/wishlist"
                      className="block text-sm text-primary mb-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Heart className="w-4 h-4 inline mr-2" />
                      {language === "pt-br" ? "Favoritos" : "Wishlist"}
                    </Link>
                    <Button 
                      variant="outline" 
                      className="w-full text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      {t("common.logout")}
                    </Button>
                  </div>
                ) : (
                  <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="default" className="w-full bg-orange-500 hover:bg-orange-600">
                      {t("common.signIn")}
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
