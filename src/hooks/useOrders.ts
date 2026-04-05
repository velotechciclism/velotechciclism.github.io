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

  const loadOrders = useCallback(async () => {
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
          setOrders(data);
          return;
        }
      }

      const storageKey = getStorageKey();

      if (!storageKey) {
        setOrders([]);
        return;
      }

      const raw = localStorage.getItem(storageKey);
      const parsedOrders: Order[] = raw ? (JSON.parse(raw) as Order[]) : [];
      setOrders(parsedOrders);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl, getStorageKey, isAuthenticated, user]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  return {
    orders,
    isLoading,
    reload: loadOrders,
  };
}
