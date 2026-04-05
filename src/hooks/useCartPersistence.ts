import { useState, useEffect, useCallback } from 'react';
import { Product, CartItem } from '@/types/product';
import { useAuthContext } from '@/context/AuthContext';

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
    const storedItems = readJson<CartItem[]>(getCartKey(user?.id), []);
    setItems(storedItems);
    setIsLoading(false);
  }, [user?.id]);

  useEffect(() => {
    void loadCartItems();
  }, [loadCartItems]);

  const addItem = useCallback(async (product: Product, quantity = 1) => {
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
  }, [persistCart]);

  const removeItem = useCallback(async (productId: string) => {
    setItems((prev) => {
      const nextItems = prev.filter((item) => item.id !== productId);
      persistCart(nextItems);
      return nextItems;
    });
  }, [persistCart]);

  const updateQuantity = useCallback(async (productId: string, quantity: number) => {
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
  }, [persistCart, removeItem]);

  const clearCart = useCallback(async () => {
    setItems([]);
    persistCart([]);
  }, [persistCart]);

  const checkout = useCallback(async (paymentMethod: string, shippingAddress: string) => {
    if (!isAuthenticated || !user || items.length === 0) {
      throw new Error('Usuário não autenticado ou carrinho vazio');
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
  }, [isAuthenticated, user, items, clearCart]);

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
