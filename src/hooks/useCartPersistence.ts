import { useState, useEffect, useCallback } from 'react';
import { Product, CartItem } from '@/types/product';
import { useAuthContext } from '@/context/AuthContext';
import { getApiUrl, getBackendUnavailableMessage } from '@/lib/api';
import { getAuthToken } from '@/lib/auth';
import { MAX_UNITS_PER_PRODUCT } from '@/lib/cartRules';

function getCartKey(userId: number | undefined) {
  return userId ? `velotech:cart:${userId}` : 'velotech:cart:guest';
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

  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...(init.headers || {}),
      },
    });
  } catch (error) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error(getBackendUnavailableMessage());
    }

    throw error;
  }

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
    setIsLoading(true);

    try {
      if (isAuthenticated && user) {
        const data = await fetchAuthJson<{ items: CartItem[] }>('/cart');
        setItems(data.items || []);
      } else {
        const storedItems = readJson<CartItem[]>(getCartKey(user?.id), []);
        setItems(storedItems);
      }
    } catch (error) {
      if (isAuthenticated) {
        setItems([]);
        console.error('Erro ao carregar carrinho autenticado:', error);
      } else {
        const storedItems = readJson<CartItem[]>(getCartKey(user?.id), []);
        setItems(storedItems);
      }
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    void loadCartItems();
  }, [loadCartItems]);

  const addItem = useCallback(async (product: Product, quantity = 1) => {
    if (isAuthenticated && user) {
      const data = await fetchAuthJson<{ items: CartItem[] }>('/cart/items', {
        method: 'POST',
        body: JSON.stringify({ productId: product.id, quantity }),
      });
      setItems(data.items || []);
      return;
    }

    const existingItem = items.find((item) => item.id === product.id);
    if ((existingItem?.quantity || 0) + quantity > MAX_UNITS_PER_PRODUCT) {
      throw new Error(`Limite maximo de ${MAX_UNITS_PER_PRODUCT} unidades por produto.`);
    }

    setItems((prev) => {
      const matchedItem = prev.find((item) => item.id === product.id);

      const nextItems = matchedItem
        ? prev.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          )
        : [...prev, { ...product, quantity }];

      persistCart(nextItems);
      return nextItems;
    });
  }, [isAuthenticated, items, persistCart, user]);

  const removeItem = useCallback(async (productId: string) => {
    if (isAuthenticated && user) {
      const data = await fetchAuthJson<{ items: CartItem[] }>(`/cart/items/${productId}`, {
        method: 'DELETE',
      });
      setItems(data.items || []);
      return;
    }

    setItems((prev) => {
      const nextItems = prev.filter((item) => item.id !== productId);
      persistCart(nextItems);
      return nextItems;
    });
  }, [isAuthenticated, persistCart, user]);

  const updateQuantity = useCallback(async (productId: string, quantity: number) => {
    if (quantity > MAX_UNITS_PER_PRODUCT) {
      throw new Error(`Limite maximo de ${MAX_UNITS_PER_PRODUCT} unidades por produto.`);
    }

    if (isAuthenticated && user) {
      const data = await fetchAuthJson<{ items: CartItem[] }>(`/cart/items/${productId}`, {
        method: 'PATCH',
        body: JSON.stringify({ quantity }),
      });
      setItems(data.items || []);
      return;
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
      await fetchAuthJson<{ ok: boolean }>('/cart/items', { method: 'DELETE' });
    }

    setItems([]);
    persistCart([]);
  }, [isAuthenticated, persistCart, user]);

  const checkout = useCallback(async (paymentMethod: string, shippingAddress: string) => {
    if (!isAuthenticated || !user || items.length === 0) {
      throw new Error('Usuário não autenticado ou carrinho vazio');
    }

    const order = await fetchAuthJson<{ id: string }>('/cart/checkout', {
      method: 'POST',
      body: JSON.stringify({ paymentMethod, shippingAddress }),
    });
    setItems([]);
    persistCart([]);
    return order;
  }, [isAuthenticated, user, items.length, persistCart]);

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
