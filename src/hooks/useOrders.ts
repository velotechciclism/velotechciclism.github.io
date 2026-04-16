import { useState, useEffect, useCallback } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { getApiUrl } from '@/lib/api';
import { getAuthToken } from '@/lib/auth';

interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  product_image: string | null;
  product_price: number;
  quantity: number;
}

interface Order {
  id: string;
  user_id: string;
  total: number;
  status: string;
  payment_method: string | null;
  shipping_address: string | null;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}

export function useOrders() {
  const { user, isAuthenticated } = useAuthContext();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const apiUrl = getApiUrl();

  const getStorageKey = useCallback(() => {
    if (!user) {
      return null;
    }

    return `velotech:orders:${user.id}`;
  }, [user]);

  const getLocalOrders = useCallback((): Order[] => {
    const storageKey = getStorageKey();

    if (!storageKey) {
      return [];
    }

    const raw = localStorage.getItem(storageKey);
    return raw ? (JSON.parse(raw) as Order[]) : [];
  }, [getStorageKey]);

  const loadOrders = useCallback(async () => {
    setIsLoading(true);

    if (!isAuthenticated || !user) {
      setOrders([]);
      setIsLoading(false);
      return;
    }

    try {
      const token = getAuthToken();

      if (token) {
        const response = await fetch(`${apiUrl}/orders/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = (await response.json()) as Order[];
          const localOrders = getLocalOrders();
          setOrders(data.length > 0 ? data : localOrders);
          return;
        }
      }

      setOrders(getLocalOrders());
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
      setOrders(getLocalOrders());
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl, getLocalOrders, isAuthenticated, user]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  return {
    orders,
    isLoading,
    reload: loadOrders,
  };
}
