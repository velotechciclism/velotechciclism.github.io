import { useState, useEffect, useCallback } from 'react';
import { Product, CartItem } from '@/types/product';
import { useAuthContext } from '@/context/AuthContext';
import { getApiUrl, getBackendUnavailableMessage } from '@/lib/api';
import { getAuthToken, isLocalAuthToken } from '@/lib/auth';
import { MAX_UNITS_PER_PRODUCT } from '@/lib/cartRules';
import { createLocalOrder } from '@/lib/localOrders';
import { readLocalCart, writeLocalCart } from '@/lib/localCart';

function getCartKey(userId: number | undefined) {
  return userId ? `velotech:cart:${userId}` : 'velotech:cart:guest';
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
  const shouldUseRemotePersistence = Boolean(
    isAuthenticated && user && !isLocalAuthToken(getAuthToken())
  );

  const persistCart = useCallback(
    (nextItems: CartItem[]) => writeLocalCart(getCartKey(user?.id), nextItems),
    [user?.id]
  );

  const loadCartItems = useCallback(async () => {
    setIsLoading(true);

    try {
      if (shouldUseRemotePersistence) {
        const data = await fetchAuthJson<{ items: CartItem[] }>('/cart');
        setItems(data.items || []);
      } else {
        let storedItems = readLocalCart(getCartKey(user?.id));
        if (user && storedItems.length === 0) {
          const guestItems = readLocalCart(getCartKey(undefined));
          if (guestItems.length > 0) {
            storedItems = guestItems;
            await writeLocalCart(getCartKey(user.id), guestItems);
            await writeLocalCart(getCartKey(undefined), []);
          }
        }
        setItems(storedItems);
      }
    } catch (error) {
      if (isAuthenticated) {
        setItems([]);
        console.error('Erro ao carregar carrinho autenticado:', error);
      } else {
        const storedItems = readLocalCart(getCartKey(user?.id));
        setItems(storedItems);
      }
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, shouldUseRemotePersistence, user]);

  useEffect(() => {
    void loadCartItems();
  }, [loadCartItems]);

  const addItem = useCallback(async (product: Product, quantity = 1) => {
    if (shouldUseRemotePersistence) {
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

    const nextItems = existingItem
      ? items.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item)
      : [...items, { ...product, quantity }];
    await persistCart(nextItems);
    setItems(nextItems);
  }, [items, persistCart, shouldUseRemotePersistence]);

  const removeItem = useCallback(async (productId: string) => {
    if (shouldUseRemotePersistence) {
      const data = await fetchAuthJson<{ items: CartItem[] }>(`/cart/items/${productId}`, {
        method: 'DELETE',
      });
      setItems(data.items || []);
      return;
    }

    const nextItems = items.filter((item) => item.id !== productId);
    await persistCart(nextItems);
    setItems(nextItems);
  }, [items, persistCart, shouldUseRemotePersistence]);

  const updateQuantity = useCallback(async (productId: string, quantity: number) => {
    if (quantity > MAX_UNITS_PER_PRODUCT) {
      throw new Error(`Limite maximo de ${MAX_UNITS_PER_PRODUCT} unidades por produto.`);
    }

    if (shouldUseRemotePersistence) {
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

    const nextItems = items.map((item) =>
      item.id === productId ? { ...item, quantity } : item
    );
    await persistCart(nextItems);
    setItems(nextItems);
  }, [items, persistCart, removeItem, shouldUseRemotePersistence]);

  const clearCart = useCallback(async () => {
    if (shouldUseRemotePersistence) {
      await fetchAuthJson<{ ok: boolean }>('/cart/items', { method: 'DELETE' });
    }

    setItems([]);
    await persistCart([]);
  }, [persistCart, shouldUseRemotePersistence]);

  const checkout = useCallback(async (paymentMethod: string, shippingAddress: string, promoCode?: string) => {
    if (!isAuthenticated || !user || items.length === 0) {
      throw new Error('Usuário não autenticado ou carrinho vazio');
    }

    const order = shouldUseRemotePersistence
      ? await fetchAuthJson<{ id: string }>('/cart/checkout', {
          method: 'POST',
          body: JSON.stringify({ paymentMethod, shippingAddress, promoCode }),
        })
      : await createLocalOrder(user.id, items, paymentMethod, shippingAddress, promoCode);

    setItems([]);
    await persistCart([]);
    return order;
  }, [isAuthenticated, user, items, persistCart, shouldUseRemotePersistence]);

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
