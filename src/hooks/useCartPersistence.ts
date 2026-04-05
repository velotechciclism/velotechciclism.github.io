import { useState, useEffect, useCallback } from 'react';
import { Product, CartItem } from '@/types/product';
import { useAuthContext } from '@/context/AuthContext';
import { getApiUrl } from '@/lib/api';
import { getAuthToken } from '@/lib/auth';

interface StoredOrderItem {
  id: string;
  product_id: string;
  product_name: string;
  product_image: string | null;
  product_price: number;
  quantity: number;
}

interface StoredOrder {
  id: string;
  user_id: string;
  total: number;
  status: string;
  payment_method: string;
  shipping_address: string;
  created_at: string;
  updated_at: string;
  items: StoredOrderItem[];
}

function getCartKey(userId: number | undefined) {
  return userId ? `velotech:cart:${userId}` : 'velotech:cart:guest';
}

function getOrderKey(userId: number) {
  return `velotech:orders:${userId}`;
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);

    if (!raw) {
      return fallback;
    }

    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

const API_URL = getApiUrl();

async function fetchAuthJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getAuthToken();

  if (!token) {
    throw new Error('Usuario nao autenticado');
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(init.headers || {}),
    },
  });

  if (!response.ok) {
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const payload = (await response.json()) as { error?: string };
      throw new Error(payload.error || 'Erro na requisicao');
    }
    throw new Error('Erro na requisicao');
  }

  return (await response.json()) as T;
}

export function useCartPersistence() {
  const { user, isAuthenticated } = useAuthContext();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const persistCart = useCallback(
    (nextItems: CartItem[]) => {
      localStorage.setItem(getCartKey(user?.id), JSON.stringify(nextItems));
    },
    [user?.id]
  );

  const loadCartItems = useCallback(async () => {
    try {
      if (isAuthenticated && user) {
        const data = await fetchAuthJson<{ items: CartItem[] }>('/cart');
        setItems(data.items || []);
      } else {
        const storedItems = readJson<CartItem[]>(getCartKey(user?.id), []);
        setItems(storedItems);
      }
    } catch {
      const storedItems = readJson<CartItem[]>(getCartKey(user?.id), []);
      setItems(storedItems);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user, user?.id]);

  useEffect(() => {
    void loadCartItems();
  }, [loadCartItems]);

  const addItem = useCallback(async (product: Product, quantity = 1) => {
    if (isAuthenticated && user) {
      try {
        const data = await fetchAuthJson<{ items: CartItem[] }>('/cart/items', {
          method: 'POST',
          body: JSON.stringify({ productId: product.id, quantity }),
        });
        setItems(data.items || []);
        return;
      } catch {
        // fallback abaixo
      }
    }

    setItems((prev) => {
      const existingItem = prev.find((item) => item.id === product.id);

      const nextItems = existingItem
        ? prev.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          )
        : [...prev, { ...product, quantity }];

      persistCart(nextItems);
      return nextItems;
    });
  }, [isAuthenticated, persistCart, user]);

  const removeItem = useCallback(async (productId: string) => {
    if (isAuthenticated && user) {
      try {
        const data = await fetchAuthJson<{ items: CartItem[] }>(`/cart/items/${productId}`, {
          method: 'DELETE',
        });
        setItems(data.items || []);
        return;
      } catch {
        // fallback abaixo
      }
    }

    setItems((prev) => {
      const nextItems = prev.filter((item) => item.id !== productId);
      persistCart(nextItems);
      return nextItems;
    });
  }, [isAuthenticated, persistCart, user]);

  const updateQuantity = useCallback(async (productId: string, quantity: number) => {
    if (isAuthenticated && user) {
      try {
        const data = await fetchAuthJson<{ items: CartItem[] }>(`/cart/items/${productId}`, {
          method: 'PATCH',
          body: JSON.stringify({ quantity }),
        });
        setItems(data.items || []);
        return;
      } catch {
        // fallback abaixo
      }
    }

    if (quantity <= 0) {
      await removeItem(productId);
      return;
    }

    setItems((prev) => {
      const nextItems = prev.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      );
      persistCart(nextItems);
      return nextItems;
    });
  }, [isAuthenticated, persistCart, removeItem, user]);

  const clearCart = useCallback(async () => {
    if (isAuthenticated && user) {
      try {
        await fetchAuthJson<{ ok: boolean }>('/cart/items', { method: 'DELETE' });
      } catch {
        // fallback abaixo
      }
    }

    setItems([]);
    persistCart([]);
  }, [isAuthenticated, persistCart, user]);

  const checkout = useCallback(async (paymentMethod: string, shippingAddress: string) => {
    if (!isAuthenticated || !user || items.length === 0) {
      throw new Error('Usuário não autenticado ou carrinho vazio');
    }

    try {
      const order = await fetchAuthJson<{ id: string }>('/cart/checkout', {
        method: 'POST',
        body: JSON.stringify({ paymentMethod, shippingAddress }),
      });
      setItems([]);
      persistCart([]);
      return order;
    } catch {
      // fallback abaixo
    }

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const now = new Date().toISOString();
    const order: StoredOrder = {
      id: crypto.randomUUID(),
      user_id: String(user.id),
      total,
      status: 'pending',
      payment_method: paymentMethod,
      shipping_address: shippingAddress,
      created_at: now,
      updated_at: now,
      items: items.map((item) => ({
        id: crypto.randomUUID(),
        product_id: item.id,
        product_name: item.name,
        product_image: item.image,
        product_price: item.price,
        quantity: item.quantity,
      })),
    };

    const storageKey = getOrderKey(user.id);
    const existingOrders = readJson<StoredOrder[]>(storageKey, []);
    localStorage.setItem(storageKey, JSON.stringify([order, ...existingOrders]));

    await clearCart();
    return order;
  }, [isAuthenticated, user, items, clearCart, persistCart]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    checkout,
    totalItems,
    totalPrice,
    isLoading,
  };
}
