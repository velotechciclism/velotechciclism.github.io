import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Product, CartItem } from '@/types/product';
import { useAuthContext } from '@/context/AuthContext';

interface CartItemDB {
  id: string;
  user_id: string;
  product_id: string;
  product_name: string;
  product_image: string | null;
  product_price: number;
  quantity: number;
  created_at: string;
  updated_at: string;
}

export function useCartPersistence() {
  const { user, isAuthenticated } = useAuthContext();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar itens do carrinho do banco de dados
  const loadCartItems = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setItems([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const cartItems: CartItem[] = (data || []).map((item: CartItemDB) => ({
        id: item.product_id,
        name: item.product_name,
        image: item.product_image || '/placeholder.svg',
        price: Number(item.product_price),
        quantity: item.quantity,
        category: '',
        description: '',
        rating: 0,
        reviewCount: 0,
        inStock: true,
        brand: '',
      }));

      setItems(cartItems);
    } catch (error) {
      console.error('Erro ao carregar carrinho:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  // Carregar carrinho quando usuário muda
  useEffect(() => {
    loadCartItems();
  }, [loadCartItems]);

  // Adicionar item ao carrinho
  const addItem = useCallback(async (product: Product, quantity = 1) => {
    if (!isAuthenticated || !user) {
      // Se não estiver logado, apenas adiciona localmente
      setItems((prev) => {
        const existingItem = prev.find((item) => item.id === product.id);
        if (existingItem) {
          return prev.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        }
        return [...prev, { ...product, quantity }];
      });
      return;
    }

    try {
      // Verificar se o item já existe
      const { data: existing } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('user_id', user.id)
        .eq('product_id', product.id)
        .maybeSingle();

      if (existing) {
        // Atualizar quantidade
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: existing.quantity + quantity })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Inserir novo item
        const { error } = await supabase.from('cart_items').insert({
          user_id: user.id,
          product_id: product.id,
          product_name: product.name,
          product_image: product.image,
          product_price: product.price,
          quantity,
        });

        if (error) throw error;
      }

      // Recarregar carrinho
      await loadCartItems();
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
    }
  }, [isAuthenticated, user, loadCartItems]);

  // Remover item do carrinho
  const removeItem = useCallback(async (productId: string) => {
    if (!isAuthenticated || !user) {
      setItems((prev) => prev.filter((item) => item.id !== productId));
      return;
    }

    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (error) throw error;

      await loadCartItems();
    } catch (error) {
      console.error('Erro ao remover item:', error);
    }
  }, [isAuthenticated, user, loadCartItems]);

  // Atualizar quantidade
  const updateQuantity = useCallback(async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeItem(productId);
      return;
    }

    if (!isAuthenticated || !user) {
      setItems((prev) =>
        prev.map((item) =>
          item.id === productId ? { ...item, quantity } : item
        )
      );
      return;
    }

    try {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (error) throw error;

      await loadCartItems();
    } catch (error) {
      console.error('Erro ao atualizar quantidade:', error);
    }
  }, [isAuthenticated, user, loadCartItems, removeItem]);

  // Limpar carrinho
  const clearCart = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setItems([]);
      return;
    }

    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      setItems([]);
    } catch (error) {
      console.error('Erro ao limpar carrinho:', error);
    }
  }, [isAuthenticated, user]);

  // Finalizar compra (criar pedido)
  const checkout = useCallback(async (paymentMethod: string, shippingAddress: string) => {
    if (!isAuthenticated || !user || items.length === 0) {
      throw new Error('Usuário não autenticado ou carrinho vazio');
    }

    try {
      const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

      // Criar pedido
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total,
          status: 'pending',
          payment_method: paymentMethod,
          shipping_address: shippingAddress,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Criar itens do pedido
      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.id,
        product_name: item.name,
        product_image: item.image,
        product_price: item.price,
        quantity: item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Limpar carrinho
      await clearCart();

      return order;
    } catch (error) {
      console.error('Erro ao finalizar compra:', error);
      throw error;
    }
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
