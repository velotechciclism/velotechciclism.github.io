import React, { useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { BarChart3, Boxes, EyeOff, ShieldCheck, Star, Users } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthContext } from "@/context/AuthContext";
import { getCatalogProducts, updateProductInventory } from "@/lib/localCatalog";
import { persistBrowserDatabase, queryRows, runStatement } from "@/lib/browserDatabase";
import { toast } from "sonner";

type LocalUserAdminRow = {
  id: number;
  email: string;
  name: string;
  role: "customer" | "admin";
  status: "active" | "blocked";
  created_at: string;
};

type ReviewAdminRow = {
  id: string;
  product_id: string;
  name: string;
  rating: number;
  comment: string;
  status: string;
  created_at: string;
};

type FavoriteRow = { total: number };

function readUsers(): LocalUserAdminRow[] {
  return queryRows<LocalUserAdminRow>(
    `SELECT id, email, name, role, status, created_at FROM local_users ORDER BY created_at DESC`
  );
}

function readReviews(): ReviewAdminRow[] {
  return queryRows<ReviewAdminRow>(
    `SELECT id, product_id, name, rating, comment, status, created_at
       FROM product_reviews ORDER BY created_at DESC`
  );
}

function readFavoriteCount(): number {
  return queryRows<FavoriteRow>("SELECT COUNT(*) AS total FROM wishlist_items")[0]?.total || 0;
}

const Admin: React.FC = () => {
  const { isAuthenticated, profile } = useAuthContext();
  const [users, setUsers] = useState(() => readUsers());
  const [reviews, setReviews] = useState(() => readReviews());
  const [catalogProducts, setCatalogProducts] = useState(() => getCatalogProducts({ includeHidden: true }));

  const isAdmin = profile?.role === "admin";

  const stats = useMemo(() => {
    const lowStockProducts = catalogProducts.filter((product) => (product.stockAvailable || 0) <= 5);

    return {
      products: catalogProducts.length,
      users: users.length,
      reviews: reviews.filter((review) => review.status !== "rejected").length,
      favorites: readFavoriteCount(),
      lowStock: lowStockProducts.length,
    };
  }, [catalogProducts, reviews, users]);

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 bg-black px-4 py-16 text-white">
          <div className="mx-auto max-w-xl rounded-lg border border-white/10 bg-zinc-900 p-8 text-center">
            <ShieldCheck className="mx-auto mb-4 h-10 w-10 text-primary" />
            <h1 className="font-display text-2xl font-bold">Acesso administrativo restrito</h1>
            <p className="mt-3 text-zinc-300">
              Entre com a conta administradora para gerir produtos, stock, usuários e avaliações.
            </p>
            <Link to="/" className="mt-6 inline-block">
              <Button variant="yellow">Voltar ao site</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const refreshAdminData = () => {
    setUsers(readUsers());
    setReviews(readReviews());
    setCatalogProducts(getCatalogProducts({ includeHidden: true }));
  };

  const updateUser = async (userId: number, values: Partial<Pick<LocalUserAdminRow, "role" | "status">>) => {
    const currentUser = users.find((user) => user.id === userId);
    if (!currentUser) return;

    runStatement("UPDATE local_users SET role = ?, status = ? WHERE id = ?", [
      values.role || currentUser.role,
      values.status || currentUser.status,
      userId,
    ]);
    await persistBrowserDatabase();
    refreshAdminData();
    toast.success("Usuário atualizado.");
  };

  const rejectReview = async (reviewId: string) => {
    runStatement("UPDATE product_reviews SET status = 'rejected' WHERE id = ?", [reviewId]);
    await persistBrowserDatabase();
    refreshAdminData();
    toast.success("Avaliação removida da vitrine.");
  };

  const handleInventoryChange = async (
    productId: string,
    field: "stockTotal" | "stockAvailable" | "maxPerUser",
    rawValue: string
  ) => {
    const product = catalogProducts.find((item) => item.id === productId);
    if (!product) return;

    const nextValues = {
      stockTotal: product.stockTotal || 0,
      stockAvailable: product.stockAvailable || 0,
      maxPerUser: product.maxPerUser || 5,
      isHidden: Boolean(product.isHidden),
      [field]: Number(rawValue),
    };

    await updateProductInventory(productId, nextValues);
    refreshAdminData();
  };

  const toggleProductVisibility = async (productId: string) => {
    const product = catalogProducts.find((item) => item.id === productId);
    if (!product) return;

    await updateProductInventory(productId, {
      stockTotal: product.stockTotal || 0,
      stockAvailable: product.stockAvailable || 0,
      maxPerUser: product.maxPerUser || 5,
      isHidden: !product.isHidden,
    });
    refreshAdminData();
    toast.success(product.isHidden ? "Produto visível novamente." : "Produto ocultado.");
  };

  const statCards = [
    { label: "Produtos", value: stats.products, icon: Boxes },
    { label: "Usuários", value: stats.users, icon: Users },
    { label: "Avaliações", value: stats.reviews, icon: Star },
    { label: "Favoritos", value: stats.favorites, icon: BarChart3 },
    { label: "Stock reduzido", value: stats.lowStock, icon: EyeOff },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-black text-white">
        <section className="border-b border-white/10 bg-zinc-950 py-8">
          <div className="container mx-auto px-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-primary">Administração</p>
                <h1 className="font-display text-3xl font-bold">Painel VeloTech</h1>
              </div>
              <p className="text-sm text-zinc-300">{profile?.name} · {profile?.email}</p>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {statCards.map((card) => (
              <div key={card.label} className="rounded-lg border border-white/10 bg-zinc-900 p-4">
                <card.icon className="mb-3 h-5 w-5 text-primary" />
                <p className="text-sm text-zinc-400">{card.label}</p>
                <p className="mt-1 text-2xl font-bold">{card.value}</p>
              </div>
            ))}
          </div>

          <Tabs defaultValue="products" className="mt-8">
            <TabsList className="grid w-full max-w-2xl grid-cols-3">
              <TabsTrigger value="products">Produtos</TabsTrigger>
              <TabsTrigger value="users">Usuários</TabsTrigger>
              <TabsTrigger value="reviews">Avaliações</TabsTrigger>
            </TabsList>

            <TabsContent value="products" className="mt-6">
              <div className="overflow-x-auto rounded-lg border border-white/10 bg-zinc-900">
                <table className="w-full min-w-[860px] text-sm">
                  <thead className="bg-zinc-950 text-left text-zinc-300">
                    <tr>
                      <th className="p-3">Produto</th>
                      <th className="p-3">Categoria</th>
                      <th className="p-3">Stock total</th>
                      <th className="p-3">Disponível</th>
                      <th className="p-3">Max/user</th>
                      <th className="p-3">Estado</th>
                      <th className="p-3">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {catalogProducts.map((product) => (
                      <tr key={product.id} className="border-t border-white/10">
                        <td className="p-3 font-medium">{product.name}</td>
                        <td className="p-3 text-zinc-300">{product.category}</td>
                        <td className="p-3">
                          <Input
                            type="number"
                            min={0}
                            value={product.stockTotal || 0}
                            onChange={(event) => handleInventoryChange(product.id, "stockTotal", event.target.value)}
                            className="h-9 w-24"
                          />
                        </td>
                        <td className="p-3">
                          <Input
                            type="number"
                            min={0}
                            value={product.stockAvailable || 0}
                            onChange={(event) => handleInventoryChange(product.id, "stockAvailable", event.target.value)}
                            className="h-9 w-24"
                          />
                        </td>
                        <td className="p-3">
                          <Input
                            type="number"
                            min={1}
                            value={product.maxPerUser || 5}
                            onChange={(event) => handleInventoryChange(product.id, "maxPerUser", event.target.value)}
                            className="h-9 w-24"
                          />
                        </td>
                        <td className="p-3">
                          <span className={product.isHidden ? "text-red-300" : "text-green-300"}>
                            {product.isHidden ? "Oculto" : "Visível"}
                          </span>
                        </td>
                        <td className="p-3">
                          <Button variant="outline" size="sm" onClick={() => toggleProductVisibility(product.id)}>
                            {product.isHidden ? "Mostrar" : "Ocultar"}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="users" className="mt-6">
              <div className="overflow-x-auto rounded-lg border border-white/10 bg-zinc-900">
                <table className="w-full min-w-[760px] text-sm">
                  <thead className="bg-zinc-950 text-left text-zinc-300">
                    <tr>
                      <th className="p-3">Nome</th>
                      <th className="p-3">E-mail</th>
                      <th className="p-3">Permissão</th>
                      <th className="p-3">Estado</th>
                      <th className="p-3">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-t border-white/10">
                        <td className="p-3 font-medium">{user.name}</td>
                        <td className="p-3 text-zinc-300">{user.email}</td>
                        <td className="p-3">{user.role === "admin" ? "Administrador" : "Utilizador"}</td>
                        <td className="p-3">{user.status === "blocked" ? "Bloqueado" : "Ativo"}</td>
                        <td className="flex flex-wrap gap-2 p-3">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={user.email === profile?.email}
                            onClick={() => updateUser(user.id, { role: user.role === "admin" ? "customer" : "admin" })}
                          >
                            {user.role === "admin" ? "Remover admin" : "Promover"}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={user.email === profile?.email}
                            onClick={() => updateUser(user.id, { status: user.status === "blocked" ? "active" : "blocked" })}
                          >
                            {user.status === "blocked" ? "Desbloquear" : "Bloquear"}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <div className="grid gap-4 lg:grid-cols-2">
                {reviews.length > 0 ? reviews.map((review) => (
                  <article key={review.id} className="rounded-lg border border-white/10 bg-zinc-900 p-4">
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{review.name}</p>
                        <p className="text-xs text-zinc-400">{review.product_id} · {review.rating}/5</p>
                      </div>
                      <span className={review.status === "rejected" ? "text-red-300" : "text-green-300"}>
                        {review.status === "rejected" ? "Removida" : "Publicada"}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-300">{review.comment}</p>
                    {review.status !== "rejected" && (
                      <Button className="mt-4" variant="outline" size="sm" onClick={() => rejectReview(review.id)}>
                        Remover avaliação
                      </Button>
                    )}
                  </article>
                )) : (
                  <div className="rounded-lg border border-white/10 bg-zinc-900 p-8 text-center text-zinc-300">
                    Nenhuma avaliação salva neste navegador.
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Admin;
