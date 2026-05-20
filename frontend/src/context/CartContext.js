import React, { createContext, useState, useContext, useCallback } from 'react';
import api from '../services/api';
import { useError } from './ErrorContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const { addError } = useError();


  const fetchCart = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/cart');
      setCartItems(response?.data?.items || []);
      console.log('Cart items', response?.data?.items);
      setCartTotal(response.data.total || 0);
    } catch (error) {
      addError({
        type: 'error',
        message: error.message || 'Failed to load cart',
        details: error.details,
        status: error.status,
      });
      setCartItems([]);
      setCartTotal(0);
    } finally {
      setLoading(false);
    }
  }, [addError]);

  const addToCart = useCallback(async (productId, quantity = 1) => {
    try {
      await api.post('/cart/items', {
        product_id: productId,
        quantity: quantity,
      });
      await fetchCart();

      return true;
    } catch (error) {
      addError({
        type: 'error',
        message: 'Failed to add item to cart',
        details: error.details,
        status: error.status,
      });
      throw error;
    }
  }, [addError, fetchCart]);

  const updateCartItem = useCallback(async (itemId, quantity) => {
    try {
      const response = await api.post(`/cart/items/${itemId}`, {
        quantity: quantity,
      });
      if (response.data.cart) {
        setCartItems(response.data.cart.items);
        setCartTotal(response.data.total);
      }
    } catch (error) {
      addError({
        type: 'error',
        message: 'Failed to update cart item',
        details: error.details,
        status: error.status,
      });
      throw error;
    }
  }, [addError]);

  const removeFromCart = useCallback(async (itemId) => {
    try {
      await api.delete(`/cart/items/${itemId}`);
      const updatedItems = cartItems.filter(item => item.id !== itemId);
      setCartItems(updatedItems);

      let total = 0;
      updatedItems.forEach(item => {
        total += item.price * item.quantity;
      });
      setCartTotal(total);
    } catch (error) {
      addError({
        type: 'error',
        message: 'Failed to remove item from cart',
        details: error.details,
        status: error.status,
      });
      throw error;
    }
  }, [cartItems, addError]);

  const clearCart = useCallback(() => {
    setCartItems([]);
    setCartTotal(0);
  }, []);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartTotal,
        loading,
        fetchCart,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};